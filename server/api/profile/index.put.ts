import { readMultipartFormData } from "h3";
import { extname } from "path";
import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
	try {
		const session = await getServerSession(event);
		if (!session?.user?.id) {
			throw createError({ statusCode: 401, message: "No autorizado" });
		}

		const userId = parseInt(session.user.id);

		const formData = await readMultipartFormData(event);
		if (!formData) {
			throw createError({ statusCode: 400, message: "Datos inválidos" });
		}
		console.log(formData);

		let nombre = "";
		let apellido = "";
		let avatar = "";
		const informacion: Record<string, any> = {};

		const storage = useStorage("public");

		for (const field of formData) {
			if (field.type?.startsWith("image/") && field.name === "avatarFile" && field.filename) {
				// Validar extensión
				const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
				let ext = extname(field.filename).toLowerCase();
				if (!allowedExts.includes(ext)) {
					ext = ".jpg";
				}

				// Generar clave única dentro del storage
				const fileKey = userId.toString() + ext;
				await storage.setItemRaw(fileKey, field.data);

				avatar = fileKey;
			} else {
				const key = field.name;
				const value = field.data.toString();

				if (key === "nombre") nombre = value;
				else if (key === "apellido") apellido = value;
				else if (key === "avatar") avatar = avatar || value;
				else if (key?.startsWith("informacion.")) {
					const infoKey = key.split(".")[1];
					informacion[infoKey] = value;
				}
			}
		}

		const currentUser = await prisma.usuario.findUnique({
			where: { id: userId },
		});

		const updatedUser = await prisma.usuario.update({
			where: { id: userId },
			data: {
				nombre: nombre,
				apellido: apellido,
			},
		});

		return {
			statusCode: 200,
			message: "Perfil actualizado correctamente",
			user: updatedUser,
		};
	} catch (error: any) {
		console.error("Error al actualizar el perfil:", error);
		throw createError({
			statusCode: 500,
			message: error.message || "Error al actualizar el perfil",
		});
	}
});
