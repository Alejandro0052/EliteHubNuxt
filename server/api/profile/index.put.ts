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

		const contentType = (event.node.req.headers['content-type'] || '') as string;

		let nombre = "";
		let apellido = "";
		let correo = "";
		let avatar = "";
		const informacion: Record<string, any> = {};

		const storage = useStorage("public");

		if (contentType.includes('application/json')) {
			// Client sent JSON (no file upload). Read JSON body.
			const json = await readBody(event) as any;
			nombre = json.nombre || '';
			apellido = json.apellido || '';
			correo = json.correo || json.email || '';
			avatar = json.avatar || '';
			if (json.informacion) {
				Object.assign(informacion, json.informacion);
			}
		} else {
			// Fallback: expect multipart/form-data
			const formData = await readMultipartFormData(event);
			if (!formData) {
				throw createError({ statusCode: 400, message: "Datos inválidos" });
			}

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
					else if (key === "correo" || key === "email") correo = value;
					else if (key === "avatar") avatar = avatar || value;
					else if (key?.startsWith("informacion.")) {
						const infoKey = key.split(".")[1];
						informacion[infoKey] = value;
					}
				}
			}
		}

		// Actualizar datos básicos del usuario
		const updateData: Record<string, any> = {
			nombre,
			apellido,
		};
		if (correo) {
			updateData.correo = correo;
		}
		if (avatar) {
			// avatar may already include a leading slash (from upload endpoint) or be a bare key
			updateData.avatar = avatar.startsWith('/') ? avatar : '/' + avatar;
		}

		// Actualizar información adicional en el modelo Informacion
		let updatedInfo = null;
		const currentUser = await prisma.usuario.findUnique({
			where: { id: userId },
			include: { informacion: true },
		});

		if (Object.keys(informacion).length > 0) {
		
			if (informacion.tipoUsuarioId) {
				const parsed = parseInt(informacion.tipoUsuarioId as string);
				if (!Number.isNaN(parsed)) {
					informacion.tipoUsuarioId = parsed;
				} else {
					delete informacion.tipoUsuarioId;
				}
			}

			if (informacion.fechaNacimiento) {
				const dateStr = informacion.fechaNacimiento;
				if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
					informacion.fechaNacimiento = new Date(dateStr);
				} else {
					const match = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
					if (match) {
						informacion.fechaNacimiento = new Date(match[1]);
					} else {
						informacion.fechaNacimiento = null;
					}
				}
			}

			if (currentUser?.informacionId) {
				updatedInfo = await prisma.informacion.update({
					where: { id: currentUser.informacionId },
					data: {
						...informacion,
					},
					});
			} else {
				// No existe Informacion para este usuario: crear y asociar
				const createdInfo = await prisma.informacion.create({
					data: {
						...informacion,
					},
					});

				// Asociar la nueva informacion al usuario
				await prisma.usuario.update({
					where: { id: userId },
					data: { informacionId: createdInfo.id },
				});

				updatedInfo = createdInfo;
			}
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
