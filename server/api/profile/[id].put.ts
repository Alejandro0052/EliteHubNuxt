export default defineEventHandler(async (event) => {
	await requireSession(event, { requireAdmin: true });

	const id = event.context.params?.id;
	if (!id) throw createError({ statusCode: 400, message: "ID requerido" });

	try {
		const body = await readBody(event);
		const { user, informacion } = await updateUsuarioProfile(parseInt(id), body);

		return {
			statusCode: 200,
			message: "Perfil actualizado correctamente",
			user,
			informacion,
		};
	} catch (error: any) {
		if (error.statusCode) throw error;
		console.error("Error al actualizar el perfil (admin):", error);
		throw createError({ statusCode: 500, message: "Error al actualizar el perfil" });
	}
});
