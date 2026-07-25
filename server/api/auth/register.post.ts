import { hash } from "bcrypt";
import { GENEROS, PAISES } from "#shared/utils/fixedLists";

const TIPO_DEPORTISTA = "Deportista";
const TIPO_MARCA = "Marca";
const TIPO_NUTRICIONISTA = "Nutricionista";
const TIPO_PATROCINADOR = "Patrocinador";

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
	const { tipoUsuarioId, correo, password, aceptaTerminos } = body;

	// 1) tipoUsuarioId debe resolver a un TipoUsuario real
	if (isBlank(tipoUsuarioId)) {
		throw createError({ statusCode: 400, message: "Debes seleccionar un tipo de usuario." });
	}
	const tipoUsuario = await prisma.tipoUsuario.findUnique({ where: { id: Number(tipoUsuarioId) } });
	if (!tipoUsuario) {
		throw createError({ statusCode: 400, message: "El tipo de usuario seleccionado no es válido." });
	}

	// 2) correo/password presentes
	if (isBlank(correo) || isBlank(password)) {
		throw createError({ statusCode: 400, message: "Correo y contraseña son requeridos." });
	}
	if (typeof password !== "string" || password.length < 8) {
		throw createError({ statusCode: 400, message: "La contraseña debe tener mínimo 8 caracteres." });
	}

	const existingUser = await prisma.usuario.findUnique({ where: { correo } });
	if (existingUser) {
		throw createError({ statusCode: 400, message: "El correo ya está registrado. Inicia sesión o usa otro correo." });
	}

	// 3) T&C
	if (aceptaTerminos !== true) {
		throw createError({ statusCode: 400, message: "Debes aceptar los términos y condiciones." });
	}

	// 4) campos requeridos por tipo
	if (tipoUsuario.tipo === TIPO_DEPORTISTA) {
		requireFields(body, [
			"primerNombre",
			"segundoNombre",
			"primerApellido",
			"segundoApellido",
			"deporteId",
			"fechaNacimiento",
			"genero",
			"nacionalidad",
			"ciudadResidencia",
			"bio",
			"altura",
			"peso",
			"nivel",
			"experiencia",
			"objetivosActuales",
		]);
	} else if (tipoUsuario.tipo === TIPO_MARCA) {
		requireFields(body, [
			"nombreComercial",
			"nit",
			"telefono",
			"direccionContacto",
			"nombreContacto",
			"cargoContacto",
			"bio",
			"redSocialUrl",
			"sitioWeb",
		]);
	} else if (tipoUsuario.tipo === TIPO_NUTRICIONISTA) {
		requireFields(body, [
			"nombres",
			"apellidos",
			"fechaNacimiento",
			"genero",
			"telefono",
			"pais",
			"ciudadResidencia",
			"bio",
			"profesion",
			"universidad",
			"anoGraduacion",
			"especialidad",
			"anosExperiencia",
			"modalidadAtencion",
		]);
	} else if (tipoUsuario.tipo === TIPO_PATROCINADOR) {
		requireFields(body, ["nombres", "apellidos", "fechaNacimiento", "telefono", "pais", "ciudadResidencia", "bio"]);
	} else {
		throw createError({ statusCode: 400, message: "El tipo de usuario seleccionado no es válido." });
	}

	// 5) género/país/nacionalidad deben pertenecer a las listas fijas
	if (!isBlank(body.genero) && !(GENEROS as readonly string[]).includes(body.genero)) {
		throw createError({ statusCode: 400, message: "El género seleccionado no es válido." });
	}
	if (!isBlank(body.nacionalidad) && !(PAISES as readonly string[]).includes(body.nacionalidad)) {
		throw createError({ statusCode: 400, message: "La nacionalidad seleccionada no es válida." });
	}
	if (!isBlank(body.pais) && !(PAISES as readonly string[]).includes(body.pais)) {
		throw createError({ statusCode: 400, message: "El país seleccionado no es válido." });
	}

	// 6) deporte debe resolver a una fila real (solo Deportista)
	let deporte = null;
	if (tipoUsuario.tipo === TIPO_DEPORTISTA) {
		deporte = await prisma.deporte.findUnique({ where: { id: Number(body.deporteId) } });
		if (!deporte) {
			throw createError({ statusCode: 400, message: "El deporte seleccionado no es válido." });
		}
	}

	try {
		const hashedPassword = await hash(password, 12);

		const usuario = await prisma.$transaction(async (tx) => {
			const informacionData: Record<string, any> = {
				bio: body.bio ?? null,
				telefono: body.telefono ?? null,
				genero: body.genero ?? null,
				fechaNacimiento: body.fechaNacimiento ? new Date(body.fechaNacimiento) : null,
				tipoUsuarioId: tipoUsuario.id,
			};

			if (tipoUsuario.tipo === TIPO_DEPORTISTA) {
				Object.assign(informacionData, {
					segundoNombre: body.segundoNombre,
					segundoApellido: body.segundoApellido,
					nacionalidad: body.nacionalidad,
					ciudadResidencia: body.ciudadResidencia,
					altura: body.altura !== undefined ? Number(body.altura) : null,
					peso: body.peso !== undefined ? Number(body.peso) : null,
					objetivosActuales: body.objetivosActuales,
					marcasPersonales: body.marcasPersonales ?? null,
					lesiones: body.lesiones ?? null,
				});
			} else if (tipoUsuario.tipo === TIPO_MARCA) {
				Object.assign(informacionData, {
					nombreComercial: body.nombreComercial,
					nit: body.nit,
					sitioWeb: body.sitioWeb,
					nombreContacto: body.nombreContacto,
					cargoContacto: body.cargoContacto,
					direccionContacto: body.direccionContacto,
				});
			} else if (tipoUsuario.tipo === TIPO_NUTRICIONISTA) {
				Object.assign(informacionData, {
					pais: body.pais,
					ciudadResidencia: body.ciudadResidencia,
					profesion: body.profesion,
					especialidad: body.especialidad,
					universidad: body.universidad,
					anoGraduacion: body.anoGraduacion !== undefined ? Number(body.anoGraduacion) : null,
					anosExperiencia: body.anosExperiencia !== undefined ? Number(body.anosExperiencia) : null,
					certificadosAdicionales: body.certificadosAdicionales ?? null,
					modalidadAtencion: body.modalidadAtencion,
				});
			} else if (tipoUsuario.tipo === TIPO_PATROCINADOR) {
				Object.assign(informacionData, {
					pais: body.pais,
					ciudadResidencia: body.ciudadResidencia,
					sitioWeb: body.sitioWeb ?? null,
				});
			}

			const informacion = await tx.informacion.create({ data: informacionData });

			let nombre: string;
			let apellido: string;
			if (tipoUsuario.tipo === TIPO_DEPORTISTA) {
				nombre = body.primerNombre;
				apellido = body.primerApellido;
			} else if (tipoUsuario.tipo === TIPO_MARCA) {
				nombre = body.nombreComercial;
				apellido = "";
			} else {
				nombre = body.nombres;
				apellido = body.apellidos;
			}

			const nuevoUsuario = await tx.usuario.create({
				data: {
					nombre,
					apellido,
					correo,
					password: hashedPassword,
					informacionId: informacion.id,
				},
			});

			if (tipoUsuario.tipo === TIPO_DEPORTISTA && deporte) {
				await tx.usuarioDeporte.create({
					data: {
						usuarioId: nuevoUsuario.id,
						deporteId: deporte.id,
						experiencia: Number(body.experiencia),
						nivel: body.nivel,
					},
				});
			}

			const redSocialUrl = body.redesSociales ?? body.redSocialUrl;
			if ((tipoUsuario.tipo === TIPO_DEPORTISTA || tipoUsuario.tipo === TIPO_MARCA) && !isBlank(redSocialUrl)) {
				await tx.redSocial.create({
					data: {
						nombre: "Red social principal",
						url: redSocialUrl,
						informacionId: informacion.id,
					},
				});
			}

			return nuevoUsuario;
		});

		return {
			message: "Usuario registrado exitosamente",
			user: { id: usuario.id, firstName: usuario.nombre, lastName: usuario.apellido, email: usuario.correo },
		};
	} catch (error: any) {
		if (error.statusCode) throw error;
		if (error.code === "P2002") {
			throw createError({ statusCode: 400, message: "El correo ya está registrado. Inicia sesión o usa otro correo." });
		}
		console.error("Error en registro:", error);
		throw createError({ statusCode: 500, message: "Error interno del servidor" });
	}
});
