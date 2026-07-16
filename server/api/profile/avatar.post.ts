import { readMultipartFormData } from 'h3'
import { extname } from 'path'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  const userId = parseInt(session.user.id as string)
  const form = await readMultipartFormData(event)
  if (!form) throw createError({ statusCode: 400, message: 'No file' })

  const storage = useStorage('public')
  let avatarUrl = ''

  for (const field of form) {
    if (field.type?.startsWith('image/') && (field.name === 'avatar' || field.name === 'avatarFile') && field.filename) {
      const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
      let ext = extname(field.filename).toLowerCase()
      if (!allowed.includes(ext)) ext = '.jpg'
      const key = `avatar-${userId}-${Date.now()}${ext}`
      await storage.setItemRaw(key, field.data)
      avatarUrl = '/' + key
      break
    }
  }

  if (!avatarUrl) throw createError({ statusCode: 400, message: 'Imagen no válida' })

  return { url: avatarUrl }
})
