import { ASUNTOS_CONTACTO } from "#shared/utils/fixedLists";

function isBlank(value: unknown) {
	return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

function requireFields(body: Record<string, any>, fields: string[]) {
	const missing = fields.filter((f) => isBlank(body[f]));
	if (missing.length > 0) {
		throw createError({ statusCode: 400, message: `Faltan campos requeridos: ${missing.join(", ")}` });
	}
}

export default defineEventHandler(async (event) => {
	const body = await readBody(event);

	requireFields(body, ["firstName", "lastName", "email", "subject", "message"]);

	if (!(ASUNTOS_CONTACTO as readonly string[]).includes(body.subject)) {
		throw createError({ statusCode: 400, message: "El asunto seleccionado no es válido." });
	}

	try {
		const mensaje = await prisma.mensajeContacto.create({
			data: {
				nombre: body.firstName,
				apellido: body.lastName,
				correo: body.email,
				telefono: body.phone || null,
				asunto: body.subject,
				mensaje: body.message,
			},
		});

		return { message: "Mensaje registrado exitosamente", id: mensaje.id };
	} catch (error: any) {
		if (error.statusCode) throw error;
		console.error("Error al guardar mensaje de contacto:", error);
		throw createError({ statusCode: 500, message: "Error interno del servidor" });
	}
});
