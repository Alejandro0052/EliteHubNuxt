import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const categorias = await prisma.categoriaCatalogo.findMany({ orderBy: { nombre: 'asc' } });
    return categorias;
  } catch (error: any) {
    console.error('Error fetching CategoriaCatalogo:', error);
    throw createError({ statusCode: 500, message: 'Error al obtener categorías' });
  }
});
