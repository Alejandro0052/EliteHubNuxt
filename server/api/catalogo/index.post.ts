import { readMultipartFormData } from 'h3'
import { extname } from 'path'

export default defineEventHandler(async (event) => {
  const usuario = await requireType(event, 'Marca')

  const form = await readMultipartFormData(event)
  const storage = useStorage('public')

  let nombre = ''
  let tipoItem = ''
  let categoriaId: number | null = null
  const imagenes: string[] = []

  if (!form) throw createError({ statusCode: 400, message: 'Datos inválidos' })

  for (const field of form) {
    if (field.type?.startsWith('image/') && field.name === 'imagenFile' && field.filename) {
      const allowed = ['.jpg', '.jpeg', '.png', '.webp']
      let ext = extname(field.filename).toLowerCase()
      if (!allowed.includes(ext)) ext = '.jpg'
      const key = `catalogo-${usuario.id}-${Date.now()}-${imagenes.length}${ext}`
      await storage.setItemRaw(key, field.data)
      imagenes.push('/' + key)
    } else {
      const key = field.name
      const value = field.data.toString()
      if (key === 'nombre') nombre = value
      else if (key === 'tipoItem') tipoItem = value
      else if (key === 'categoriaId') categoriaId = parseInt(value)
    }
  }

  if (!nombre) throw createError({ statusCode: 400, message: 'Nombre requerido' })
  if (tipoItem !== 'SERVICIO' && tipoItem !== 'FISICO') {
    throw createError({ statusCode: 400, message: 'Tipo de item no válido' })
  }
  if (!categoriaId) throw createError({ statusCode: 400, message: 'Categoría requerida' })
  if (imagenes.length === 0) throw createError({ statusCode: 400, message: 'Debes subir al menos una imagen' })

  const categoria = await prisma.categoriaCatalogo.findUnique({ where: { id: categoriaId } })
  if (!categoria) throw createError({ statusCode: 400, message: 'La categoría seleccionada no es válida.' })

  const item = await prisma.itemCatalogo.create({
    data: {
      nombre,
      tipoItem: tipoItem as any,
      imagenes,
      categoriaId,
      usuarioId: usuario.id,
    },
  })

  return item
})
