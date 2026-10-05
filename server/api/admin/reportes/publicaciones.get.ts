export default defineEventHandler(async (event) => {
  await requireSession(event, { requireAdmin: true })

  const query = getQuery(event)
  const desde = query.desde ? new Date(query.desde as string) : undefined
  const hasta = query.hasta ? new Date(query.hasta as string) : undefined

  if (desde && isNaN(desde.getTime())) {
    throw createError({ statusCode: 400, message: 'Parámetro "desde" inválido' })
  }
  if (hasta && isNaN(hasta.getTime())) {
    throw createError({ statusCode: 400, message: 'Parámetro "hasta" inválido' })
  }
  if (desde && hasta && desde > hasta) {
    throw createError({ statusCode: 400, message: 'El rango de fechas es inválido: "desde" debe ser anterior o igual a "hasta"' })
  }

  const porTipo = await getPublicacionesPorTipo(desde, hasta)
  const total = Object.values(porTipo).reduce((acc, n) => acc + n, 0)

  return { porTipo, total }
})
