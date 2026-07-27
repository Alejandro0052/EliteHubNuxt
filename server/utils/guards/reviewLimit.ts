export async function assertNoDuplicateReview(autorId: number, nutricionistaId: number) {
	const existing = await prisma.resena.findUnique({
		where: { autorId_nutricionistaId: { autorId, nutricionistaId } },
	});
	if (existing) {
		throw createError({ statusCode: 409, message: "Ya dejaste una reseña para este nutricionista." });
	}
}
