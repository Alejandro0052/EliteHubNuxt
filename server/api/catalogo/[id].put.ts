import { readMultipartFormData } from 'h3'
import { extname } from 'path'

export default defineEventHandler(async (event) => {
  const usuario = await requireSession(event)

  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: 'ID requerido' })

  const existing = await prisma.itemCatalogo.findUnique({ where: { id: parseInt(id) } })
  if (!existing) throw createError({ statusCode: 404, message: 'Ítem no encontrado' })

  if (!authorOrAdmin('catalogo_item', 'edit', { autorId: existing.usuarioId }, usuario)) {
    throw createError({ statusCode: 403, message: 'No autorizado' })
  }

  const form = await readMultipartFormData(event)
  const storage = useStorage('public')

  const data: any = {}
  const nuevasImagenes: string[] = []

  if (!form) throw createError({ statusCode: 400, message: 'Datos inválidos' })

  for (const field of form) {
    if (field.type?.startsWith('image/') && field.name === 'imagenFile' && field.filename) {
      const allowed = ['.jpg', '.jpeg', '.png', '.webp']
      let ext = extname(field.filename).toLowerCase()
      if (!allowed.includes(ext)) ext = '.jpg'
      const key = `catalogo-${existing.usuarioId}-${Date.now()}-${nuevasImagenes.length}${ext}`
      await storage.setItemRaw(key, field.data)
      nuevasImagenes.push('/' + key)
    } else {
      const key = field.name
      const value = field.data.toString()
      if (key === 'nombre') data.nombre = value
      else if (key === 'tipoItem') data.tipoItem = value
      else if (key === 'categoriaId') data.categoriaId = parseInt(value)
    }
  }

  // Reemplazo total de imágenes solo si se subieron nuevas — si no, se conservan las actuales (FR-6 style).
  if (nuevasImagenes.length > 0) {
    data.imagenes = nuevasImagenes
  }

  if (data.tipoItem && data.tipoItem !== 'SERVICIO' && data.tipoItem !== 'FISICO') {
    throw createError({ statusCode: 400, message: 'Tipo de item no válido' })
  }

  if (data.categoriaId) {
    const categoria = await prisma.categoriaCatalogo.findUnique({ where: { id: data.categoriaId } })
    if (!categoria) throw createError({ statusCode: 400, message: 'La categoría seleccionada no es válida.' })
  }

  const updated = await prisma.itemCatalogo.update({
    where: { id: existing.id },
    data,
  })

  return updated
})
