import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const noticias = await prisma.noticia.findMany({
      where: { publicado: true, ...activeUserFilter('autor') },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        titulo: true,
        slug: true,
        resumen: true,
        imagen: true,
        publishedAt: true,
        createdAt: true,
      },
    })

    return noticias
  } catch (err: any) {
    throw createError({ statusCode: 500, message: 'Error al listar noticias' })
  }
})
