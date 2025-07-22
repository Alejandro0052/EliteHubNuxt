import prisma from "../server/utils/prisma";

async function main() {
	const paisColombia = await prisma.pais.upsert({
		where: { pais: "Colombia" },
		update: {},
		create: {
			pais: "Colombia",
			ciudades: {
				create: [
					{
						ciudad: "Bogotá",
						barrios: {
							create: [
								{ barrio: "Chapinero" },
								{ barrio: "Usaquén" },
								{ barrio: "Teusaquillo" },
								{ barrio: "Suba" },
								{ barrio: "La Candelaria" },
								{ barrio: "Barrios Unidos" },
								{ barrio: "Fontibón" },
								{ barrio: "Kennedy" },
								{ barrio: "Engativá" },
								{ barrio: "Santa Fe" },
								{ barrio: "Ciudad Bolívar" },
								{ barrio: "San Cristóbal" },
								{ barrio: "Tunjuelito" },
								{ barrio: "Usme" },
								{ barrio: "Bosa" },
								{ barrio: "Rafael Uribe Uribe" },
								{ barrio: "Los Mártires" },
								{ barrio: "Antonio Nariño" },
								{ barrio: "Puente Aranda" },
							],
						},
					},
					{
						ciudad: "Medellín",
						barrios: {
							create: [
								{ barrio: "El Poblado" },
								{ barrio: "Laureles" },
								{ barrio: "Belén" },
								{ barrio: "Castilla" },
								{ barrio: "Robledo" },
								{ barrio: "Envigado" },
								{ barrio: "Sabaneta" },
								{ barrio: "La América" },
								{ barrio: "Aranjuez" },
								{ barrio: "Guayabal" },
								{ barrio: "Santa Cruz" },
								{ barrio: "Manrique" },
								{ barrio: "Doce de Octubre" },
							],
						},
					},
					{
						ciudad: "Cali",
						barrios: {
							create: [
								{ barrio: "San Antonio" },
								{ barrio: "Granada" },
								{ barrio: "El Peñón" },
								{ barrio: "Ciudad Jardín" },
								{ barrio: "Calima" },
								{ barrio: "Vipasa" },
								{ barrio: "Menga" },
								{ barrio: "Unidad Deportiva" },
								{ barrio: "Calipso" },
								{ barrio: "Cañaveralejo" },
								{ barrio: "Pance" },
								{ barrio: "Siloé" },
								{ barrio: "Brisas de Mayo" },
								{ barrio: "Jorge Isaacs" },
								{ barrio: "El Vallado" },
							],
						},
					},
				],
			},
		},
		include: {
			ciudades: {
				include: {
					barrios: true,
				},
			},
		},
	});

	await prisma.tipoUsuario.upsert({
		where: { tipo: "Patrocinador" },
		update: {},
		create: { tipo: "Patrocinador" },
	});
	await prisma.tipoUsuario.upsert({
		where: { tipo: "Marca" },
		update: {},
		create: { tipo: "Marca" },
	});
	await prisma.tipoUsuario.upsert({
		where: { tipo: "Nutricionista" },
		update: {},
		create: { tipo: "Nutricionista" },
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
