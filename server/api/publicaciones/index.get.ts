export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const cursor = query.cursor ? parseInt(query.cursor as string) : undefined
  const take = 20

  const items = await prisma.publicacion.findMany({
    where: activeUserFilter('autor'),
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
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

  return { items, nextCursor: items.length === take ? items[items.length - 1].id : null }
})
