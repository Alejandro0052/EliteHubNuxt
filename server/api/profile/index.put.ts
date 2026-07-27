import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
	try {
		const session = await getServerSession(event);
		if (!session?.user?.id) {
			throw createError({ statusCode: 401, message: "No autorizado" });
		}

		const userId = parseInt(session.user.id);
		const body = await readBody(event);

		const { user, informacion } = await updateUsuarioProfile(userId, body);

		return {
			statusCode: 200,
			message: "Perfil actualizado correctamente",
			user,
			informacion,
		};
	} catch (error: any) {
		if (error.statusCode) throw error;
		console.error("Error al actualizar el perfil:", error);
		throw createError({
			statusCode: 500,
			message: error.message || "Error al actualizar el perfil",
		});
	}
});
