export const FUTBOL_POSICIONES = ["Portero", "Defensa central", "Lateral", "Mediocampista", "Extremo", "Delantero"] as const;
export const FUTBOL_PIE_DOMINANTE = ["Derecho", "Izquierdo", "Ambidiestro"] as const;
export const FUTBOL_NIVEL_COMPETENCIA = ["Aficionado", "Semiprofesional", "Profesional", "Selección", "Ligas menores por edad"] as const;
export const FUTBOL_ATRIBUTOS = ["Visión de juego", "Regate/1v1", "Potencia física", "Cobrador de tiros libres", "Buen pie débil", "Liderazgo/Capitán"] as const;
export const CAMPOS_FUTBOL_REQUERIDOS = [
	"posicionPrincipal", "pieDominante", "clubActual", "nivelCompetencia", "saltoVertical",
	"atributosDestacados", "trayectoriaClubes", "logrosTitulos", "reconocimientosIndividuales",
	"estadisticasUltimaTemporada", "convocatoriasSelecciones",
] as const;

export const BOXEO_CATEGORIAS_PESO = ["Mosca", "Gallo", "Pluma", "Ligero", "Welter", "Mediano", "Pesado"] as const;
export const BOXEO_GUARDIA = ["Ortodoxa", "Zurda/Southpaw"] as const;
export const BOXEO_ESTILO = ["Técnico", "Pegador", "Contragolpeador"] as const;
export const BOXEO_MODALIDAD = ["Amateur", "Profesional", "Ambos"] as const;
export const CAMPOS_BOXEO_REQUERIDOS = [
	"categoriaPeso", "guardia", "gimnasioClubEntrenador", "estiloPelea", "modalidad",
	"record", "federacionLiga", "convocatoriasLogrosRankings",
] as const;

// Deportes para los que `UsuarioDeporte.camposEspecificos` se persiste (en vez de forzarse a
// null). "Otros" solo guarda `nombreDeporte` (texto libre, opcional) -- no tiene campos
// obligatorios ni listas fijas, así que no necesita un CAMPOS_OTROS_REQUERIDOS como Fútbol/Boxeo.
export const DEPORTES_CON_CAMPOS_ESPECIFICOS = ["Fútbol", "Boxeo", "Otros"] as const;
