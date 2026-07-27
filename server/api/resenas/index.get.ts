export default defineEventHandler(async (event) => {
	await requireSession(event);

	const query = getQuery(event);
	const nutricionistaId = parseInt(query.nutricionistaId as string);
	if (!nutricionistaId) throw createError({ statusCode: 400, message: "Nutricionista requerido" });

	const resenas = await prisma.resena.findMany({
		where: { nutricionistaId, retractada: false },
		include: { autor: { select: { id: true, nombre: true, apellido: true, avatar: true } } },
		orderBy: { createdAt: "desc" },
	});

	return resenas;
});
