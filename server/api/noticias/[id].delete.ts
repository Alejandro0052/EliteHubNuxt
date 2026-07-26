export default defineEventHandler(async (event) => {
  const usuario = await requireSession(event)

  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: 'ID requerido' })

  const existing = await prisma.noticia.findUnique({ where: { id: parseInt(id) } })
  if (!existing) throw createError({ statusCode: 404, message: 'Noticia no encontrada' })

  if (!authorOrAdmin('evento_noticia', 'delete', existing, usuario)) {
    throw createError({ statusCode: 403, message: 'No autorizado' })
  }

  await prisma.noticia.delete({ where: { id: parseInt(id) } })
  return { success: true }
})
