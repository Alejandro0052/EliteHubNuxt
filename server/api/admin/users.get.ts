import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.id || !session.user.isAdmin) {
    throw createError({ statusCode: 403, message: 'No autorizado' })
  }

  try {
    const users = await prisma.usuario.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo: true,
        activo: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        informacion: { select: { tipoUsuario: { select: { tipo: true } } } },
      },
    })

    return users
  } catch (err: any) {
    console.error(err)
    throw createError({ statusCode: 500, message: 'Error al obtener usuarios' })
  }
})
