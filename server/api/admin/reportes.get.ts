export default defineEventHandler(async (event) => {
  await requireSession(event, { requireAdmin: true })

  const porTipo = await getUsuariosPorTipo()
  const total = Object.values(porTipo).reduce((acc, n) => acc + n, 0)

  return { porTipo, total }
})
