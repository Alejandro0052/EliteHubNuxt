export default defineEventHandler(async (event) => {
	const usuario = await requireSession(event);

	const id = event.context.params?.id;
	if (!id) throw createError({ statusCode: 400, message: "ID requerido" });

	const existing = await prisma.itemCatalogo.findUnique({ where: { id: parseInt(id) } });
	if (!existing) throw createError({ statusCode: 404, message: "Ítem no encontrado" });

	if (!authorOrAdmin("catalogo_item", "delete", { autorId: existing.usuarioId }, usuario)) {
		throw createError({ statusCode: 403, message: "No autorizado" });
	}

	await prisma.itemCatalogo.delete({ where: { id: existing.id } });
	return { success: true };
});
