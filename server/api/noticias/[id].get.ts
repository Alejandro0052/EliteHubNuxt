import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: 'ID requerido' })

  const noticia = await prisma.noticia.findUnique({
    where: { id: parseInt(id) },
  })

  if (!noticia) throw createError({ statusCode: 404, message: 'Noticia no encontrada' })

  return noticia
})
