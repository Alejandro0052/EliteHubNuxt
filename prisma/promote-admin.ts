import prisma from "../server/utils/prisma";

async function main() {
	const correo = process.argv[2];
	if (!correo) {
		console.error("Uso: pnpm exec ts-node prisma/promote-admin.ts <correo>");
		process.exit(1);
	}

	const usuario = await prisma.usuario.update({
		where: { correo },
		data: { isAdmin: true },
	});

	console.log(`✅ ${usuario.correo} ahora es admin (isAdmin=true)`);
}

main()
	.catch(async (e) => {
		console.error("Error:", e);
		await prisma.$disconnect();
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
