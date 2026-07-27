import prisma from "../server/utils/prisma";
import { hash } from "bcrypt";

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

	// Crear rol Administrador y un usuario admin por defecto
	let adminRole = await prisma.rol.findFirst({ where: { nombre: "Administrador" } });
	if (!adminRole) {
		adminRole = await prisma.rol.create({ data: { nombre: "Administrador" } });
	}

	// Crear usuario administrador (correo único). Cambia la contraseña por seguridad en producción.
	const adminEmail = "admin@elitehub.test";
	const adminPassword = await hash("Admin1234", 12);

	await prisma.usuario.upsert({
		where: { correo: adminEmail },
		update: { nombre: "Admin", apellido: "Root", isAdmin: true, rolId: adminRole.id, password: adminPassword },
		create: {
			nombre: "Admin",
			apellido: "Root",
			correo: adminEmail,
			password: adminPassword,
			isAdmin: true,
			rolId: adminRole.id,
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
	await prisma.tipoUsuario.upsert({
		where: { tipo: "Deportista" },
		update: {},
		create: { tipo: "Deportista" },
	});

	// Story 1.1: lista fija de deportes (FR-19)
	const deportes = [
		"Fútbol",
		"Baloncesto",
		"Ciclismo",
		"Running",
		"Crossfit",
		"Voleibol",
		"Gimnasia",
		"Boxeo",
		"Natación",
		"Otros",
	];
	for (const nombre of deportes) {
		await prisma.deporte.upsert({
			where: { nombre },
			update: {},
			create: { nombre },
		});
	}

	// Story 3.1: lista fija de categorías de catálogo (FR-39)
	const categoriasCatalogo = ["Ropa Deportiva", "Equipamiento", "Suplementos", "Tecnología", "Accesorios"];
	for (const nombre of categoriasCatalogo) {
		await prisma.categoriaCatalogo.upsert({
			where: { nombre },
			update: {},
			create: { nombre },
		});
	}

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
