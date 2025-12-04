import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: 'ID requerido' })

  const evento = await prisma.evento.findUnique({
    where: { id: parseInt(id) },
  })

  if (!evento) throw createError({ statusCode: 404, message: 'Evento no encontrado' })

  return evento
})
