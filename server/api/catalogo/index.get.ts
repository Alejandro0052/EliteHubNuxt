export default defineEventHandler(async (event) => {
	await requireSession(event);

	const query = getQuery(event);
	const cursor = query.cursor ? parseInt(query.cursor as string) : undefined;
	const categoriaId = query.categoriaId ? parseInt(query.categoriaId as string) : undefined;
	const usuarioId = query.usuarioId ? parseInt(query.usuarioId as string) : undefined;
	const take = 20;

	const items = await prisma.itemCatalogo.findMany({
		where: {
			...activeUserFilter("usuario"),
			...(categoriaId ? { categoriaId } : {}),
			...(usuarioId ? { usuarioId } : {}),
		},
		take,
		...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
		orderBy: { id: "asc" },
		include: { categoria: true, usuario: { select: { id: true, nombre: true, apellido: true } } },
	});

	return { items, nextCursor: items.length === take ? items[items.length - 1].id : null };
});
