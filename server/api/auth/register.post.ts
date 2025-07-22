import { hash } from "bcrypt";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const { nombre, apellido, correo, password } = body;

	if (!nombre || !apellido || !correo || !password) {
		throw createError({
			statusCode: 400,
			statusMessage: "Todos los campos son requeridos",
		});
	}

	try {
		// Verificar si el usuario ya existe
		const existingUser = await prisma.usuario.findUnique({
			where: { correo: correo },
		});

		if (existingUser) {
			throw createError({
				statusCode: 400,
				statusMessage: "El usuario ya existe",
			});
		}

		// Hashear la contraseña
		const hashedPassword = await hash(password, 12);

		// Crear el usuario
		const user = await prisma.usuario.create({
			data: {
				nombre: nombre,
				apellido: apellido,
				correo: correo,
				password: hashedPassword,
			},
		});

		return {
			message: "Usuario registrado exitosamente",
			user: {
				id: user.id,
				firstName: user.nombre,
				lastName: user.apellido,
				email: user.correo,
			},
		};
	} catch (error: any) {
		if (error.statusCode) {
			throw error;
		}

		throw createError({
			statusCode: 500,
			statusMessage: "Error interno del servidor",
		});
	}
});
