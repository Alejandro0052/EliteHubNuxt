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

		// Actualizar datos básicos del usuario
		const updateData: Record<string, any> = {
			nombre,
			apellido,
		};
		if (avatar) {
			updateData.avatar = "/" + avatar;
		}

		// Actualizar información adicional en el modelo Informacion
		let updatedInfo = null;
		const currentUser = await prisma.usuario.findUnique({
			where: { id: userId },
			include: { informacion: true },
		});

		if (currentUser?.informacionId && Object.keys(informacion).length > 0) {
			// Corregir formato de fechaNacimiento si existe
			if (informacion.fechaNacimiento) {
				// Si viene en formato ISO, convertir a Date
				const dateStr = informacion.fechaNacimiento;
				// Si ya está en formato yyyy-MM-dd, lo dejamos igual
				if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
					informacion.fechaNacimiento = new Date(dateStr);
				} else {
					// Si viene en formato ISO, extraer solo la fecha
					const match = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
					if (match) {
						informacion.fechaNacimiento = new Date(match[1]);
					} else {
						informacion.fechaNacimiento = null;
					}
				}
			}
			updatedInfo = await prisma.informacion.update({
				where: { id: currentUser.informacionId },
				data: {
					...informacion,
				},
			});
		}

		const updatedUser = await prisma.usuario.update({
			where: { id: userId },
			data: updateData,
			include: { informacion: true },
		});

		return {
			statusCode: 200,
			message: "Perfil actualizado correctamente",
			user: updatedUser,
			informacion: updatedInfo,
		};
	} catch (error: any) {
		console.error("Error al actualizar el perfil:", error);
		throw createError({
			statusCode: 500,
			message: error.message || "Error al actualizar el perfil",
		});
	}
});
