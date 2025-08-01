import { readMultipartFormData } from "h3";
import { extname } from "path";
import { getServerSession } from "#auth";
import type { Session } from "next-auth";

export default defineEventHandler(async (event) => {
	try {
		const session = (await getServerSession(event)) as Session | null;
		if (!(session as any)?.user?.id) {
			throw createError({ statusCode: 401, message: "No autorizado" });
		}

		const userId = (session as any).user.id as string;

		const formData = await readMultipartFormData(event);
		if (!formData) {
			throw createError({ statusCode: 400, message: "Datos inválidos" });
		}

		// Inicializar datos
		let firstName = "";
		let lastName = "";
		let avatar = "";
		const information: Record<string, any> = {};

		const storage = useStorage("public");

		// Procesar campos del formulario
		for (const field of formData) {
			if (field.type?.startsWith("image/") && field.name === "avatarFile" && field.filename) {
				// Validar extensión de imagen
				const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
				const ext = extname(field.filename).toLowerCase();
				if (!allowedExts.includes(ext)) {
					throw createError({
						statusCode: 400,
						message: "Extensión de archivo no permitida. Use: jpg, jpeg, png, gif, webp",
					});
				}

				// Validar tamaño (máximo 5MB)
				if (field.data.length > 5 * 1024 * 1024) {
					throw createError({
						statusCode: 400,
						message: "El archivo es demasiado grande. Máximo 5MB",
					});
				}

				// Generar nombre único para el archivo
				const timestamp = Date.now();
				const fileKey = `${userId}${ext}`;
				await storage.setItemRaw(fileKey, field.data);
				avatar = fileKey;
			} else {
				const key = field.name;
				const value = field.data.toString().trim();

				// Procesar campos básicos del usuario
				if (key === "firstName") {
					firstName = value;
				} else if (key === "lastName") {
					lastName = value;
				} else if (key === "avatar") {
					avatar = avatar || value;
				} else if (key?.startsWith("information.")) {
					// Procesar campos de información adicional
					const infoKey = key.split(".")[1];

					// Convertir tipos de datos apropiados
					if (infoKey === "birthDate" && value) {
						information[infoKey] = new Date(value);
					} else if (infoKey === "maxBudget" && value) {
						information[infoKey] = parseInt(value) || null;
					} else if (infoKey === "yearsInOperation" && value) {
						information[infoKey] = parseInt(value) || null;
					} else if (infoKey === "offices" && value) {
						// Convertir string separado por comas a array
						information[infoKey] = value
							.split(",")
							.map((office) => office.trim())
							.filter(Boolean);
					} else if (value) {
						information[infoKey] = value;
					} else {
						information[infoKey] = null;
					}
				}
			}
		}

		// Validar campos requeridos
		if (!firstName || !lastName) {
			throw createError({
				statusCode: 400,
				message: "Nombre y apellido son requeridos",
			});
		}

		// Obtener usuario actual con información
		const currentUser = await prisma.user.findUnique({
			where: { id: userId },
			include: { information: true },
		});

		if (!currentUser) {
			throw createError({ statusCode: 404, message: "Usuario no encontrado" });
		}

		// Preparar datos de actualización del usuario
		const userUpdateData: any = {
			firstName,
			lastName,
		};

		if (avatar) {
			userUpdateData.avatar = "/" + avatar;
		}

		// Manejar información adicional
		let informationRecord = null;
		if (Object.keys(information).length > 0) {
			if (currentUser.informationId) {
				// Actualizar información existente
				informationRecord = await prisma.information.update({
					where: { id: currentUser.informationId },
					data: information,
				});
			} else {
				// Crear nueva información
				informationRecord = await prisma.information.create({
					data: information,
				});

				// Vincular información al usuario
				userUpdateData.informationId = informationRecord.id;
			}
		}

		// Actualizar usuario
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: userUpdateData,
			include: {
				information: true,
				role: true,
			},
		});

		return {
			statusCode: 200,
			message: "Perfil actualizado correctamente",
			user: {
				id: updatedUser.id,
				email: updatedUser.email,
				firstName: updatedUser.firstName,
				lastName: updatedUser.lastName,
				avatar: updatedUser.avatar,
				isAdmin: updatedUser.isAdmin,
				information: updatedUser.information,
				role: updatedUser.role,
				createdAt: updatedUser.createdAt,
				updatedAt: updatedUser.updatedAt,
			},
		};
	} catch (error: any) {
		console.error("Error al actualizar el perfil:", error);

		// Manejar errores específicos de Prisma
		if (error.code === "P2002") {
			throw createError({
				statusCode: 400,
				message: "El email ya está en uso por otro usuario",
			});
		}

		if (error.statusCode) {
			throw error;
		}

		throw createError({
			statusCode: 500,
			message: "Error interno del servidor al actualizar el perfil",
		});
	}
});
