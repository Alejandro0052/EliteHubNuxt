import { readMultipartFormData } from 'h3'
import { extname } from 'path'

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default defineEventHandler(async (event) => {
  const usuario = await requireSession(event)

  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: 'ID requerido' })

  const existing = await prisma.noticia.findUnique({ where: { id: parseInt(id) } })
  if (!existing) throw createError({ statusCode: 404, message: 'Noticia no encontrada' })

  if (!authorOrAdmin('evento_noticia', 'edit', existing, usuario)) {
    throw createError({ statusCode: 403, message: 'No autorizado' })
  }

  const form = await readMultipartFormData(event)
  const storage = useStorage('public')

  const data: any = {}

  for (const field of form) {
    if (field.type?.startsWith('image/') && field.name === 'imageFile' && field.filename) {
      const allowed = ['.jpg', '.jpeg', '.png', '.webp']
      let ext = extname(field.filename).toLowerCase()
      if (!allowed.includes(ext)) ext = '.jpg'
      const key = `noticia-${Date.now()}${ext}`
      await storage.setItemRaw(key, field.data)
      data.imagen = '/' + key
    } else {
      const key = field.name
      const value = field.data.toString()
      if (key === 'titulo') {
        data.titulo = value
        data.slug = slugify(value)
      } else if (key === 'resumen') data.resumen = value
      else if (key === 'contenido') data.contenido = value
      else if (key === 'publicado') data.publicado = value === 'true'
    }
  }

  const updated = await prisma.noticia.update({
    where: { id: parseInt(id) },
    data,
  })

  return updated
})
