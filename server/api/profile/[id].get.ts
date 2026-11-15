export default defineEventHandler(async (event) => {
	await requireSession(event, { requireAdmin: true });

	const id = event.context.params?.id;
	if (!id) throw createError({ statusCode: 400, message: "ID requerido" });

	const user = await prisma.usuario.findUnique({
		where: { id: parseInt(id) },
		include: {
			informacion: { include: { tipoUsuario: true, redesSociales: true } },
			rol: true,
			UsuarioDeporte: { include: { deporte: true } },
		},
	});

	if (!user) {
		throw createError({ statusCode: 404, message: "Usuario no encontrado" });
	}

	return {
		id: user.id,
		nombre: user.nombre,
		apellido: user.apellido,
		correo: user.correo,
		avatar: user.avatar || null,
		isAdmin: user.isAdmin || false,
		activo: user.activo,
		rol: user.rol ? { id: user.rol.id, nombre: user.rol.nombre } : null,
		informacion: user.informacion || null,
		UsuarioDeporte: user.UsuarioDeporte || [],
	};
});
