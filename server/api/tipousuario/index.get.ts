import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const tipos = await prisma.tipoUsuario.findMany({ orderBy: { tipo: 'asc' } });
    return tipos;
  } catch (error: any) {
    console.error('Error fetching TipoUsuario:', error);
    throw createError({ statusCode: 500, message: 'Error al obtener tipos de usuario' });
  }
});
