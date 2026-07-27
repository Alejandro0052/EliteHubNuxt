export async function updateUsuarioProfile(userId: number, body: Record<string, any>) {
	const nombre = body.nombre || "";
	const apellido = body.apellido || "";
	const correo = body.correo || body.email || "";
	let avatar = body.avatar || "";
	const informacion: Record<string, any> = body.informacion ? { ...body.informacion } : {};
	const deporte = body.deporte as { deporteId?: number; nivel?: string; experiencia?: number } | undefined;
	const redSocialUrl = body.redSocialUrl as string | undefined;

	const updateData: Record<string, any> = { nombre, apellido };
	if (correo) updateData.correo = correo;
	if (avatar) {
		updateData.avatar = avatar.startsWith("/") ? avatar : "/" + avatar;
	}

	const currentUser = await prisma.usuario.findUnique({
		where: { id: userId },
		include: { informacion: true },
	});

	if (!currentUser) {
		throw createError({ statusCode: 404, message: "Usuario no encontrado" });
	}

	// TipoUsuario es inmutable tras el registro (AD-8): se descarta incondicionalmente aquí,
	// sin importar si el llamador es el propio usuario o un admin editando por recuperación.
	delete informacion.tipoUsuarioId;

	// ProfileEditForm envía el mismo objeto `informacion` con TODOS los campos de los 4 tipos
	// (no solo los del tipo actual), así que campos no aplicables llegan como "" — eso rompe
	// `modalidadAtencion` (columna enum: Prisma solo acepta un valor válido o null, nunca "").
	// Normalizamos "" -> null en todo el objeto antes de tocar columnas numéricas específicas.
	for (const key of Object.keys(informacion)) {
		if (informacion[key] === "") informacion[key] = null;
	}

	// Los inputs numéricos llegan como string desde <input type="number"> (igual que en register.vue,
	// que también los castea server-side) — Prisma rechaza un string en una columna Float/Int.
	const NUMERIC_FIELDS = ["altura", "peso", "anoGraduacion", "anosExperiencia"];
	for (const field of NUMERIC_FIELDS) {
		if (informacion[field] !== null && informacion[field] !== undefined) {
			informacion[field] = Number(informacion[field]);
		}
	}

	let updatedInfo = null;
	if (Object.keys(informacion).length > 0) {
		if (informacion.fechaNacimiento) {
			const dateStr = informacion.fechaNacimiento;
			if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
				informacion.fechaNacimiento = new Date(dateStr);
			} else {
				const match = typeof dateStr === "string" ? dateStr.match(/^(\d{4}-\d{2}-\d{2})/) : null;
				informacion.fechaNacimiento = match ? new Date(match[1]) : null;
			}
		}

		if (currentUser.informacionId) {
			updatedInfo = await prisma.informacion.update({
				where: { id: currentUser.informacionId },
				data: { ...informacion },
			});
		} else {
			const createdInfo = await prisma.informacion.create({ data: { ...informacion } });
			await prisma.usuario.update({ where: { id: userId }, data: { informacionId: createdInfo.id } });
			updatedInfo = createdInfo;
		}
	}

	const updatedUser = await prisma.usuario.update({
		where: { id: userId },
		data: updateData,
		include: { informacion: true },
	});

	if (deporte?.deporteId) {
		const existingDeporte = await prisma.usuarioDeporte.findFirst({ where: { usuarioId: userId } });
		// `nivel` es un enum no-nulleable con default (PRINCIPIANTE) — solo se envía si tiene un
		// valor real; una cadena vacía rompería la validación de Prisma igual que con modalidadAtencion.
		const deporteData: Record<string, any> = { deporteId: Number(deporte.deporteId) };
		if (deporte.nivel) deporteData.nivel = deporte.nivel;
		if (deporte.experiencia !== undefined && deporte.experiencia !== ("" as any)) {
			deporteData.experiencia = Number(deporte.experiencia);
		}
		if (existingDeporte) {
			await prisma.usuarioDeporte.update({ where: { id: existingDeporte.id }, data: deporteData });
		} else {
			await prisma.usuarioDeporte.create({
				data: {
					usuarioId: userId,
					deporteId: deporteData.deporteId,
					nivel: deporteData.nivel,
					experiencia: deporteData.experiencia || 0,
				},
			});
		}
	}

	if (redSocialUrl && currentUser.informacionId) {
		const existingRedSocial = await prisma.redSocial.findFirst({ where: { informacionId: currentUser.informacionId } });
		if (existingRedSocial) {
			await prisma.redSocial.update({ where: { id: existingRedSocial.id }, data: { url: redSocialUrl } });
		} else {
			await prisma.redSocial.create({
				data: { nombre: "Red social principal", url: redSocialUrl, informacionId: currentUser.informacionId },
			});
		}
	}

	return { user: updatedUser, informacion: updatedInfo };
}
