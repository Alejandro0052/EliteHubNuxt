export default defineEventHandler(async (event) => {
	await requireSession(event);

	const id = event.context.params?.id;
	if (!id) throw createError({ statusCode: 400, message: "ID requerido" });

	const item = await prisma.itemCatalogo.findFirst({
		where: { id: parseInt(id), ...activeUserFilter("usuario") },
		include: { categoria: true, usuario: { select: { id: true, nombre: true, apellido: true } } },
	});

	if (!item) {
		throw createError({ statusCode: 404, message: "Ítem no encontrado" });
	}

	return item;
});
