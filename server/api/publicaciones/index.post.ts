import { readMultipartFormData } from 'h3'
import { extname } from 'path'

export default defineEventHandler(async (event) => {
  const usuario = await requireSession(event)

  const form = await readMultipartFormData(event)
  const storage = useStorage('public')

  let texto = ''
  let imagen: string | null = null

  if (!form) throw createError({ statusCode: 400, message: 'Datos inválidos' })

  for (const field of form) {
    if (field.type?.startsWith('image/') && field.name === 'imagenFile' && field.filename && !imagen) {
      const allowed = ['.jpg', '.jpeg', '.png', '.webp']
      let ext = extname(field.filename).toLowerCase()
      if (!allowed.includes(ext)) ext = '.jpg'
      const key = `publicacion-${usuario.id}-${Date.now()}${ext}`
      await storage.setItemRaw(key, field.data)
      imagen = '/' + key
    } else if (field.name === 'texto') {
      texto = field.data.toString().trim()
    }
  }

  if (!texto) throw createError({ statusCode: 400, message: 'El texto es obligatorio' })

  const publicacion = await prisma.publicacion.create({
    data: { texto, imagen, autorId: usuario.id },
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
