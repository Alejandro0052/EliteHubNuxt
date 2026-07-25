import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const deportes = await prisma.deporte.findMany({ orderBy: { nombre: 'asc' } });
    return deportes;
  } catch (error: any) {
    console.error('Error fetching Deporte:', error);
    throw createError({ statusCode: 500, message: 'Error al obtener deportes' });
  }
});
