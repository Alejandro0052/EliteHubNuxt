export default defineEventHandler(async (event) => {
  await requireSession(event, { requireAdmin: true })

  const query = getQuery(event)
  let desde = query.desde ? new Date(query.desde as string) : undefined
  let hasta = query.hasta ? new Date(query.hasta as string) : undefined

  // An unparseable value is treated as absent, not rejected — per this story's own
  // Task 3 spec ("treat an unparseable or missing value as absent"); only a genuine
  // inverted range (both present, desde > hasta) is a real error (checked below).
  if (desde && isNaN(desde.getTime())) {
    desde = undefined
  }
  if (hasta && isNaN(hasta.getTime())) {
    hasta = undefined
  }
  if (desde && hasta && desde > hasta) {
    throw createError({ statusCode: 400, message: 'El rango de fechas es inválido: "desde" debe ser anterior o igual a "hasta"' })
  }

  const porTipo = await getPublicacionesPorTipo(desde, hasta)
  const total = Object.values(porTipo).reduce((acc, n) => acc + n, 0)

  return { porTipo, total }
})
