export async function assertNoDuplicateReview(autorId: number, nutricionistaId: number) {
	const existing = await prisma.resena.findFirst({
		where: { autorId, nutricionistaId, retractada: false },
	});
	if (existing) {
		throw createError({ statusCode: 409, message: "Ya dejaste una reseña para este nutricionista." });
	}
}
