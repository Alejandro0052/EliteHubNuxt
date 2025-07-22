import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
	const session = await getServerSession(event);

	if (!session?.user?.id) {
		throw createError({ statusCode: 401, message: "No autenticado" });
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: parseInt(session.user.id) },
			select: {
				firstName: true,
				lastName: true,
				email: true,
				id: true,
			},
		});

		if (!user) {
			throw createError({ statusCode: 404, message: "Usuario no encontrado" });
		}

		return {
			id: user.id,
			nombre: user.firstName,
			apellido: user.lastName,
			email: user.email,
			avatar: null,
		};
	} catch (error: any) {
		if (error.statusCode) {
			throw error;
		}
		throw createError({ statusCode: 500, message: "Error interno del servidor" });
	}
});
