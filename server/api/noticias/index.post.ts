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

  const form = await readMultipartFormData(event)
  const storage = useStorage('public')

  let titulo = ''
  let resumen = ''
  let contenido = ''
  let imagen = ''

  for (const field of form) {
    if (field.type?.startsWith('image/') && field.name === 'imageFile' && field.filename) {
      const allowed = ['.jpg', '.jpeg', '.png', '.webp']
      let ext = extname(field.filename).toLowerCase()
      if (!allowed.includes(ext)) ext = '.jpg'
      const key = `noticia-${Date.now()}${ext}`
      await storage.setItemRaw(key, field.data)
      imagen = '/' + key
    } else {
      const key = field.name
      const value = field.data.toString()
      if (key === 'titulo') titulo = value
      else if (key === 'resumen') resumen = value
      else if (key === 'contenido') contenido = value
    }
  }

  if (!titulo) throw createError({ statusCode: 400, message: 'Titulo requerido' })

  const slug = slugify(titulo)

  const noticia = await prisma.noticia.create({
    data: {
      titulo,
      slug,
      resumen,
      contenido,
      imagen,
      autorId: usuario.id,
      publishedAt: new Date(),
    },
  })

  return noticia
})
