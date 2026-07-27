export async function requireType(event: any, tipo: string) {
	const usuario = await requireSession(event);
	if (usuario.informacion?.tipoUsuario?.tipo !== tipo) {
		throw createError({ statusCode: 403, message: "No autorizado para este tipo de acción." });
	}
	return usuario;
}
