export default defineEventHandler(async (event) => {
	const usuario = await requireSession(event);

	const id = event.context.params?.id;
	if (!id) throw createError({ statusCode: 400, message: "ID requerido" });

	const existing = await prisma.resena.findUnique({ where: { id: parseInt(id) } });
	if (!existing) throw createError({ statusCode: 404, message: "Reseña no encontrada" });

	if (!authorOrAdmin("resena", "delete", { autorId: existing.autorId }, usuario)) {
		throw createError({ statusCode: 403, message: "No autorizado" });
	}

	await prisma.resena.delete({ where: { id: existing.id } });
	return { success: true };
});
