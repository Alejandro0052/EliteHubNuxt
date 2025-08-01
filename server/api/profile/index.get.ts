import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
	const session = await getServerSession(event);

	if (!(session as any)?.user?.id) {
		throw createError({ statusCode: 401, message: "No autenticado" });
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: (session as any).user.id },
			include: {
				information: true,
			},
		});

		if (!user) {
			throw createError({ statusCode: 404, message: "Usuario no encontrado" });
		}

		return {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			avatar: user.avatar,
			isAdmin: user.isAdmin,
			information: user.information,
		};
	} catch (error: any) {
		if (error.statusCode) {
			throw error;
		}
		throw createError({ statusCode: 500, message: "Error interno del servidor" });
	}
});
