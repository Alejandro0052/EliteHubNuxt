const TIPOS_USUARIO = ["Deportista", "Marca", "Nutricionista", "Patrocinador"] as const;

export async function getUsuariosPorTipo(): Promise<Record<(typeof TIPOS_USUARIO)[number], number>> {
	const counts = await Promise.all(
		TIPOS_USUARIO.map((tipo) =>
			prisma.usuario.count({
				where: { activo: true, informacion: { tipoUsuario: { tipo } } },
			}),
		),
	);

	return Object.fromEntries(TIPOS_USUARIO.map((tipo, i) => [tipo, counts[i]])) as Record<
		(typeof TIPOS_USUARIO)[number],
		number
	>;
}

export async function getEventosCount(): Promise<number> {
	return prisma.evento.count({ where: { publicado: true } });
}

export async function getPublicacionesPorTipo(
	desde?: Date,
	hasta?: Date,
): Promise<Record<(typeof TIPOS_USUARIO)[number], number>> {
	// `hasta` parses "YYYY-MM-DD" as UTC midnight; add 23:59:59.999 to reach end-of-day
	// without local-timezone getters, which would shift the date on a non-UTC server.
	const finDeHasta = hasta ? new Date(hasta.getTime() + 24 * 60 * 60 * 1000 - 1) : undefined;
	const createdAtFilter =
		desde || finDeHasta
			? { createdAt: { ...(desde && { gte: desde }), ...(finDeHasta && { lte: finDeHasta }) } }
			: {};

	const counts = await Promise.all(
		TIPOS_USUARIO.map((tipo) =>
			prisma.publicacion.count({
				where: {
					autor: { activo: true, informacion: { tipoUsuario: { tipo } } },
					...createdAtFilter,
				},
			}),
		),
	);

	return Object.fromEntries(TIPOS_USUARIO.map((tipo, i) => [tipo, counts[i]])) as Record<
		(typeof TIPOS_USUARIO)[number],
		number
	>;
}
