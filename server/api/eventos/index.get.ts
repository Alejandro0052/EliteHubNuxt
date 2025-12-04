import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const eventos = await prisma.evento.findMany({
      where: { publicado: true },
      orderBy: { fechaEvento: 'desc' },
      take: 20,
      select: {
        id: true,
        titulo: true,
        slug: true,
        resumen: true,
        imagen: true,
        fechaEvento: true,
        createdAt: true,
      },
    })

    return eventos
  } catch (err: any) {
    throw createError({ statusCode: 500, message: 'Error al listar eventos' })
  }
})
