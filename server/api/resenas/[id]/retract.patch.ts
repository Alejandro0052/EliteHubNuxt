export default defineEventHandler(async (event) => {
	await requireSession(event, { requireAdmin: true });

	const id = event.context.params?.id;
	if (!id) throw createError({ statusCode: 400, message: "ID requerido" });

	const existing = await prisma.resena.findUnique({ where: { id: parseInt(id) } });
	if (!existing) throw createError({ statusCode: 404, message: "Reseña no encontrada" });
	if (existing.retractada) throw createError({ statusCode: 400, message: "Esta reseña ya fue retractada." });

	const body = await readBody(event);
	const bloquearAutor = body?.bloquearAutor === true;

	await prisma.$transaction([
		prisma.resena.update({ where: { id: existing.id }, data: { retractada: true } }),
		...(bloquearAutor
			? [prisma.usuario.update({ where: { id: existing.autorId }, data: { activo: false } })]
			: []),
	]);

	return { retractada: true, autorBloqueado: bloquearAutor };
});
