import { CAMPOS_FUTBOL_REQUERIDOS, CAMPOS_BOXEO_REQUERIDOS } from "#shared/utils/camposDeporte";

function isEmpty(v: any): boolean {
	return v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
}

export function validarCamposDeporte(deporteNombre: string, campos: Record<string, any> | null | undefined) {
	if (deporteNombre === "Fútbol") {
		const faltantes = CAMPOS_FUTBOL_REQUERIDOS.filter((k) => isEmpty(campos?.[k]));
		if (faltantes.length > 0) {
			throw createError({ statusCode: 400, message: `Faltan campos de fútbol: ${faltantes.join(", ")}` });
		}
	} else if (deporteNombre === "Boxeo") {
		const faltantes = CAMPOS_BOXEO_REQUERIDOS.filter((k) => isEmpty(campos?.[k]));
		if (faltantes.length > 0) {
			throw createError({ statusCode: 400, message: `Faltan campos de boxeo: ${faltantes.join(", ")}` });
		}
	}
	// Ciclismo, Patinaje, Otros, y cualquier deporte legado (Baloncesto, Running, etc.):
	// no se valida ni se espera camposEspecificos — permanece null (AC #4, #5).
}
