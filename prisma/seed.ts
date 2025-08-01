import prisma from "../server/utils/prisma";

async function main() {
	const paisColombia = await prisma.country.upsert({
		where: { name: "Colombia" },
		update: {},
		create: {
			name: "Colombia",
			cities: {
				create: [
					{
						name: "Bogotá",
						neighborhoods: {
							create: [
								{ name: "Chapinero" },
								{ name: "Usaquén" },
								{ name: "Teusaquillo" },
								{ name: "Suba" },
								{ name: "La Candelaria" },
								{ name: "Barrios Unidos" },
								{ name: "Fontibón" },
								{ name: "Kennedy" },
								{ name: "Engativá" },
								{ name: "Santa Fe" },
								{ name: "Ciudad Bolívar" },
								{ name: "San Cristóbal" },
								{ name: "Tunjuelito" },
								{ name: "Usme" },
								{ name: "Bosa" },
								{ name: "Rafael Uribe Uribe" },
								{ name: "Los Mártires" },
								{ name: "Antonio Nariño" },
								{ name: "Puente Aranda" },
							],
						},
					},
					{
						name: "Medellín",
						neighborhoods: {
							create: [
								{ name: "El Poblado" },
								{ name: "Laureles" },
								{ name: "Belén" },
								{ name: "Castilla" },
								{ name: "Robledo" },
								{ name: "Envigado" },
								{ name: "Sabaneta" },
								{ name: "La América" },
								{ name: "Aranjuez" },
								{ name: "Guayabal" },
								{ name: "Santa Cruz" },
								{ name: "Manrique" },
								{ name: "Doce de Octubre" },
							],
						},
					},
					{
						name: "Cali",
						neighborhoods: {
							create: [
								{ name: "San Antonio" },
								{ name: "Granada" },
								{ name: "El Peñón" },
								{ name: "Ciudad Jardín" },
								{ name: "Calima" },
								{ name: "Vipasa" },
								{ name: "Menga" },
								{ name: "Unidad Deportiva" },
								{ name: "Calipso" },
								{ name: "Cañaveralejo" },
								{ name: "Pance" },
								{ name: "Siloé" },
								{ name: "Brisas de Mayo" },
								{ name: "Jorge Isaacs" },
								{ name: "El Vallado" },
							],
						},
					},
				],
			},
		},
		include: {
			cities: {
				include: {
					neighborhoods: true,
				},
			},
		},
	});

	await prisma.userType.upsert({
		where: { type: "Patrocinador" },
		update: {},
		create: { type: "Patrocinador" },
	});
	await prisma.userType.upsert({
		where: { type: "Marca" },
		update: {},
		create: { type: "Marca" },
	});
	await prisma.userType.upsert({
		where: { type: "Nutricionista" },
		update: {},
		create: { type: "Nutricionista" },
	});

	console.log("✅ Seed completado");
}

main()
	.catch(async (e) => {
		console.error("Error en seed:", e);
		await prisma.$disconnect();
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
