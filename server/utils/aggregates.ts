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
