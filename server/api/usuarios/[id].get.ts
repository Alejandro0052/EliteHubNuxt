export default defineEventHandler(async (event) => {
	await requireSession(event);

	const id = event.context.params?.id;
	if (!id) throw createError({ statusCode: 400, message: "ID requerido" });

	const usuario = await prisma.usuario.findUnique({
		where: { id: parseInt(id) },
		include: {
			informacion: { include: { tipoUsuario: true, redesSociales: true } },
			UsuarioDeporte: { include: { deporte: true } },
		},
	});

	if (!usuario || !usuario.activo) {
		throw createError({ statusCode: 404, message: "Usuario no encontrado" });
	}

	return usuario;
});
