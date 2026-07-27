import { getServerSession } from "#auth";

export async function requireSession(event: any, options: { requireAdmin?: boolean } = {}) {
	const session = await getServerSession(event);
	if (!session?.user?.id) {
		throw createError({ statusCode: 401, message: "No autenticado" });
	}

	const usuario = await prisma.usuario.findUnique({
		where: { id: parseInt(session.user.id as string) },
		include: { informacion: { include: { tipoUsuario: true } } },
	});
	if (!usuario || !usuario.activo) {
		throw createError({ statusCode: 401, message: "Tu sesión ya no es válida. Inicia sesión de nuevo." });
	}

	if (options.requireAdmin && !usuario.isAdmin) {
		throw createError({ statusCode: 403, message: "No autorizado" });
	}

	return usuario;
}
