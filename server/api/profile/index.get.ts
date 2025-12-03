import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
	const session = await getServerSession(event);

	if (!session?.user?.id) {
		throw createError({ statusCode: 401, message: "No autenticado" });
	}

	try {
		const user = await prisma.usuario.findUnique({
			where: { id: parseInt(session.user.id) },
			include: {
				informacion: {
					include: { tipoUsuario: true },
				},
			},
		});

		if (!user) {
			throw createError({ statusCode: 404, message: "Usuario no encontrado" });
		}

		return {
			id: user.id,
			nombre: user.nombre,
			apellido: user.apellido,
			correo: user.correo,
			avatar: user.avatar || null,
			informacion: user.informacion || null,
		};
	} catch (error: any) {
		if (error.statusCode) {
			throw error;
		}
		throw createError({ statusCode: 500, message: "Error interno del servidor" });
	}
});
