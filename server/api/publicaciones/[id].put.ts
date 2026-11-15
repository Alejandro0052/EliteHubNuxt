import { readMultipartFormData } from 'h3'
import { extname } from 'path'

const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp']
const VIDEO_EXT = ['.mp4', '.webm', '.mov', '.ogg']
const MAX_ITEMS = 10

export default defineEventHandler(async (event) => {
  const usuario = await requireSession(event)

  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: 'ID requerido' })

  const existing = await prisma.publicacion.findUnique({ where: { id: parseInt(id) } })
  if (!existing) throw createError({ statusCode: 404, message: 'Publicación no encontrada' })

  if (!authorOrAdmin('publicacion', 'edit', { autorId: existing.autorId }, usuario)) {
    throw createError({ statusCode: 403, message: 'No autorizado' })
  }

  const form = await readMultipartFormData(event)
  const storage = useStorage('public')

  let texto = ''
  const mediaFiles: Record<number, { data: Buffer; filename: string; type: string }> = {}
  const mediaDurations: Record<number, number> = {}

  if (!form) throw createError({ statusCode: 400, message: 'Datos inválidos' })

  for (const field of form) {
    const mediaMatch = field.name?.match(/^mediaFile_(\d+)$/)
    const durationMatch = field.name?.match(/^mediaDuration_(\d+)$/)

    if (mediaMatch && field.filename && field.type) {
      mediaFiles[parseInt(mediaMatch[1])] = { data: field.data, filename: field.filename, type: field.type }
    } else if (durationMatch) {
      mediaDurations[parseInt(durationMatch[1])] = parseFloat(field.data.toString()) || 0
    } else if (field.name === 'texto') {
      texto = field.data.toString().trim()
    }
  }

  if (!texto) throw createError({ statusCode: 400, message: 'El texto es obligatorio' })

  const indices = Object.keys(mediaFiles).map(Number).sort((a, b) => a - b)

  if (indices.length > MAX_ITEMS) {
    throw createError({ statusCode: 400, message: `Máximo ${MAX_ITEMS} archivos por publicación` })
  }

  for (const i of indices) {
    const item = mediaFiles[i]
    if (item.type.startsWith('video/')) {
      const duration = mediaDurations[i]
      if (!duration || duration > 120) {
        throw createError({ statusCode: 400, message: `El video "${item.filename}" no puede durar más de 2 minutos` })
      }
    }
  }

  let media: string[] = existing.media

  if (indices.length > 0) {
    media = []
    for (const i of indices) {
      const item = mediaFiles[i]
      if (item.type.startsWith('image/')) {
        let ext = extname(item.filename).toLowerCase()
        if (!IMAGE_EXT.includes(ext)) ext = '.jpg'
        const key = `publicacion-${usuario.id}-${Date.now()}-${i}${ext}`
        await storage.setItemRaw(key, item.data)
        media.push('/' + key)
      } else if (item.type.startsWith('video/')) {
        let ext = extname(item.filename).toLowerCase()
        if (!VIDEO_EXT.includes(ext)) ext = '.mp4'
        const key = `publicacion-video-${usuario.id}-${Date.now()}-${i}${ext}`
        await storage.setItemRaw(key, item.data)
        media.push('/' + key)
      }
    }
  }

  const publicacion = await prisma.publicacion.update({
    where: { id: existing.id },
    data: { texto, media },
    include: {
      autor: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          avatar: true,
          informacion: { select: { tipoUsuario: { select: { tipo: true } } } },
        },
      },
    },
  })

  return publicacion
})
