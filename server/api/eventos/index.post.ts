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
  let fechaEvento: string | undefined
  let ubicacion = ''

  for (const field of form) {
    if (field.type?.startsWith('image/') && field.name === 'imageFile' && field.filename) {
      const allowed = ['.jpg', '.jpeg', '.png', '.webp']
      let ext = extname(field.filename).toLowerCase()
      if (!allowed.includes(ext)) ext = '.jpg'
      const key = `evento-${Date.now()}${ext}`
      await storage.setItemRaw(key, field.data)
      imagen = '/' + key
    } else {
      const key = field.name
      const value = field.data.toString()
      if (key === 'titulo') titulo = value
      else if (key === 'resumen') resumen = value
      else if (key === 'contenido') contenido = value
      else if (key === 'fechaEvento') fechaEvento = value
      else if (key === 'ubicacion') ubicacion = value
    }
  }

  if (!titulo) throw createError({ statusCode: 400, message: 'Titulo requerido' })

  const slug = slugify(titulo)

  const evento = await prisma.evento.create({
    data: {
      titulo,
      slug,
      resumen,
      contenido,
      imagen,
      ubicacion,
      fechaEvento: fechaEvento ? new Date(fechaEvento) : undefined,
      autorId: usuario.id,
    },
  })

  return evento
})
