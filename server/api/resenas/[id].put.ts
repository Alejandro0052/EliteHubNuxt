export default defineEventHandler(async (event) => {
	const usuario = await requireSession(event);

	const id = event.context.params?.id;
	if (!id) throw createError({ statusCode: 400, message: "ID requerido" });

	const existing = await prisma.resena.findUnique({ where: { id: parseInt(id) } });
	if (!existing) throw createError({ statusCode: 404, message: "Reseña no encontrada" });

	if (!authorOrAdmin("resena", "edit", { autorId: existing.autorId }, usuario)) {
		throw createError({ statusCode: 403, message: "No autorizado" });
	}

	const body = await readBody(event);
	const rating = parseInt(body?.rating);
	const comentario = typeof body?.comentario === "string" ? body.comentario.trim() : "";

	if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
		throw createError({ statusCode: 400, message: "La calificación debe ser un número entero entre 1 y 5" });
	}

	const resena = await prisma.resena.update({
		where: { id: existing.id },
		data: { rating, comentario },
		include: { autor: { select: { id: true, nombre: true, apellido: true, avatar: true } } },
	});

	return resena;
});
