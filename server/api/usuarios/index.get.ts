const TIPOS_VALIDOS = ["Deportista", "Marca", "Nutricionista", "Patrocinador"] as const;

export default defineEventHandler(async (event) => {
	await requireSession(event);

	const query = getQuery(event);
	const tipo = query.tipo as string;
	if (!(TIPOS_VALIDOS as readonly string[]).includes(tipo)) {
		throw createError({ statusCode: 400, message: "Tipo de usuario no válido." });
	}

	const cursor = query.cursor ? parseInt(query.cursor as string) : undefined;
	const deporteId = query.deporteId ? parseInt(query.deporteId as string) : undefined;
	const take = 20;

	const items = await prisma.usuario.findMany({
		where: {
			...activeUserFilter(),
			informacion: { tipoUsuario: { tipo } },
			...(deporteId ? { UsuarioDeporte: { some: { deporteId } } } : {}),
		},
		take,
		...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
		orderBy: { id: "asc" },
		include: {
			informacion: { include: { tipoUsuario: true } },
			UsuarioDeporte: { include: { deporte: true } },
		},
	});

	return {
		items,
		nextCursor: items.length === take ? items[items.length - 1].id : null,
	};
});
