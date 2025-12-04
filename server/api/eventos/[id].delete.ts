import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.id || !session.user.isAdmin) {
    throw createError({ statusCode: 403, message: 'No autorizado' })
  }

  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: 'ID requerido' })

  await prisma.evento.delete({ where: { id: parseInt(id) } })
  return { success: true }
})
