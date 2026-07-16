import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.id || !session.user.isAdmin) {
    throw createError({ statusCode: 403, message: 'No autorizado' })
  }

  const id = parseInt(event.context.params.id)
  const { activo } = await readBody(event)
  if (typeof activo !== 'boolean') {
    throw createError({ statusCode: 400, message: 'Campo "activo" requerido y debe ser booleano' })
  }

  const user = await prisma.usuario.update({
    where: { id },
    data: { activo },
    select: { id: true, activo: true }
  })

  return { message: 'Estado actualizado', user }
})
