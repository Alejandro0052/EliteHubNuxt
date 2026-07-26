import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
	const session = await getServerSession(event);
	if (!session?.user?.id || !session.user.isAdmin) {
		throw createError({ statusCode: 403, message: "No autorizado" });
	}

	try {
		const mensajes = await prisma.mensajeContacto.findMany({
			orderBy: { createdAt: "desc" },
		});

		return mensajes;
	} catch (err: any) {
		console.error(err);
		throw createError({ statusCode: 500, message: "Error al obtener mensajes de contacto" });
	}
});
