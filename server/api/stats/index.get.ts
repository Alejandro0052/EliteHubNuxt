export default defineEventHandler(async () => {
	try {
		const [porTipo, eventos] = await Promise.all([getUsuariosPorTipo(), getEventosCount()]);

		return {
			deportistas: porTipo.Deportista,
			patrocinadores: porTipo.Patrocinador,
			marcas: porTipo.Marca,
			nutricionistas: porTipo.Nutricionista,
			eventos,
		};
	} catch (err: any) {
		console.error(err);
		throw createError({ statusCode: 500, message: "Error al obtener estadísticas" });
	}
});
