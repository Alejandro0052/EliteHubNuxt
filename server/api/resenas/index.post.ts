export default defineEventHandler(async (event) => {
	const usuario = await requireSession(event);

	const body = await readBody(event);
	const nutricionistaId = parseInt(body?.nutricionistaId);
	const rating = parseInt(body?.rating);
	const comentario = typeof body?.comentario === "string" ? body.comentario.trim() : "";

	if (!nutricionistaId) throw createError({ statusCode: 400, message: "Nutricionista requerido" });
	if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
		throw createError({ statusCode: 400, message: "La calificación debe ser un número entero entre 1 y 5" });
	}

	const target = await prisma.usuario.findUnique({
		where: { id: nutricionistaId },
		include: { informacion: { include: { tipoUsuario: true } } },
	});
	if (!target) throw createError({ statusCode: 404, message: "Nutricionista no encontrado" });
	if (target.informacion?.tipoUsuario?.tipo !== "Nutricionista") {
		throw createError({ statusCode: 400, message: "Solo se puede reseñar a un nutricionista." });
	}

	await assertNoDuplicateReview(usuario.id, nutricionistaId);

	const resena = await prisma.resena.create({
		data: { rating, comentario, autorId: usuario.id, nutricionistaId },
		include: { autor: { select: { id: true, nombre: true, apellido: true, avatar: true } } },
	});

	return resena;
});
