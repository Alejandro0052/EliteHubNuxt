import { hash } from 'bcrypt'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.id || !session.user.isAdmin) {
    throw createError({ statusCode: 403, message: 'No autorizado' })
  }

  const body = await readBody(event)
  const { nombre, apellido, correo, password, isAdmin } = body
  // activo is optional; default to true when not provided
  const activo = body.activo === undefined ? true : !!body.activo

  if (!nombre || !apellido || !correo || !password) {
    throw createError({ statusCode: 400, message: 'Todos los campos son requeridos' })
  }

  try {
    const existing = await prisma.usuario.findUnique({ where: { correo } })
    if (existing) {
      throw createError({ statusCode: 400, message: 'Usuario ya existe' })
    }

    const hashed = await hash(password, 12)

    const user = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        correo,
        password: hashed,
        isAdmin: !!isAdmin,
        activo,
      },
    })

    return {
      message: 'Usuario creado',
      user: { id: user.id, nombre: user.nombre, apellido: user.apellido, correo: user.correo, isAdmin: user.isAdmin, activo: user.activo }
    }
  } catch (err: any) {
    if (err.statusCode) throw err
    console.error(err)
    throw createError({ statusCode: 500, message: 'Error interno del servidor' })
  }
})
