export default defineEventHandler(async (event) => {
  const usuario = await requireSession(event)

  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: 'ID requerido' })

  const existing = await prisma.publicacion.findUnique({ where: { id: parseInt(id) } })
  if (!existing) throw createError({ statusCode: 404, message: 'Publicación no encontrada' })

  if (!authorOrAdmin('publicacion', 'delete', { autorId: existing.autorId }, usuario)) {
    throw createError({ statusCode: 403, message: 'No autorizado' })
  }

  await prisma.publicacion.delete({ where: { id: existing.id } })
  return { success: true }
})
