import { getServerSession } from '#auth'
import { hash } from 'bcrypt'

export default defineEventHandler(async (event) => {
  try {
    const session = await getServerSession(event)
    if (!session?.user?.id) {
      throw createError({ statusCode: 401, message: 'No autorizado' })
    }

    const userId = parseInt(session.user.id)

    const body = await readBody(event) as any
    const newPassword = body?.newPassword

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      throw createError({ statusCode: 400, message: 'La nueva contraseña debe tener al menos 6 caracteres' })
    }

    const hashed = await hash(newPassword, 10)

    await prisma.usuario.update({
      where: { id: userId },
      data: { password: hashed },
    })

    return { statusCode: 200, message: 'Contraseña actualizada correctamente' }
  } catch (err: any) {
    console.error('Error cambiando contraseña:', err)
    throw createError({ statusCode: err?.statusCode || 500, message: err?.message || 'Error cambiando la contraseña' })
  }
})
