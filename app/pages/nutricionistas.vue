<template>
	<div class="min-h-screen w-full">
		<!-- Content Editor for Admins -->
		<ContentEditor
			page="nutricionistas"
			:initial-content="pageContent"
			@updated="handleContentUpdate" />

		<!-- Hero Section -->
		<section class="relative px-4 py-20 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-7xl">
				<div class="text-center">
					<h1 class="mb-6 text-4xl font-bold text-white md:text-6xl">
						{{ pageContent.title || "Nutricionistas Deportivos" }}
					</h1>
					<p class="mx-auto mb-8 max-w-3xl text-xl text-white md:text-2xl">
						{{
							pageContent.subtitle ||
							"Optimiza tu rendimiento con la guía de expertos en nutrición deportiva"
						}}
					</p>
				</div>
			</div>
		</section>

		<!-- Main Content -->
		<section class="px-4 py-6 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-7xl">
				<!-- Custom Content -->
				<div v-if="pageContent.content" class="mb-16">
					<div class="max-w-none" v-html="pageContent.content"></div>
				</div>

				<!-- Services Grid -->
				<div class="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
					<div
						class="transform rounded-xl bg-white p-8 text-black shadow-lg transition-transform duration-300 hover:scale-105">
						<div
							class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black text-3xl text-white">
							<Icon name="fa6-solid:clipboard-list" />
						</div>
						<h3 class="mb-4 text-xl font-bold text-gray-900">Planes Personalizados</h3>
						<p class="text-gray-600">
							Diseñamos planes nutricionales específicos para tu deporte, objetivos y necesidades
							individuales.
						</p>
					</div>

					<div
						class="transform rounded-xl bg-white p-8 shadow-lg transition-transform duration-300 hover:scale-105">
						<div
							class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black text-3xl text-white">
							<Icon name="fa6-solid:chart-line" />
						</div>
						<h3 class="mb-4 text-xl font-bold text-gray-900">Seguimiento Continuo</h3>
						<p class="text-gray-600">
							Monitoreo constante de tu progreso con ajustes regulares para optimizar resultados.
						</p>
					</div>

					<div
						class="transform rounded-xl bg-white p-8 shadow-lg transition-transform duration-300 hover:scale-105">
						<div
							class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black text-3xl text-white">
							<Icon name="fa6-solid:book" />
						</div>
						<h3 class="mb-4 text-xl font-bold text-gray-900">Educación Nutricional</h3>
						<p class="text-gray-600">
							Aprende sobre nutrición deportiva para tomar decisiones informadas sobre tu
							alimentación.
						</p>
					</div>
				</div>

				<!-- Nutritionists Grid -->
				<div class="mb-16">
					<h2 class="mb-12 text-center text-3xl font-bold text-white">Nuestros Expertos</h2>
					<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
						<div
							v-for="nutritionist in nutritionists"
							:key="nutritionist.id"
							class="transform overflow-hidden rounded-xl bg-white shadow-lg transition-transform duration-300 hover:scale-105">
							<div
								class="flex h-48 items-center justify-center bg-gradient-to-br from-green-400 to-teal-500">
								<div class="flex h-24 w-24 items-center justify-center rounded-full bg-white">
									<span class="text-2xl font-bold text-gray-600">{{ nutritionist.initials }}</span>
								</div>
							</div>
							<div class="p-6">
								<h3 class="mb-2 text-xl font-bold text-gray-900">{{ nutritionist.name }}</h3>
								<p class="mb-3 font-medium text-green-600">{{ nutritionist.specialty }}</p>
								<p class="mb-4 text-sm text-gray-600">{{ nutritionist.description }}</p>
								<div class="flex items-center justify-between">
									<div class="flex items-center">
										<svg
											class="mr-1 h-4 w-4 text-yellow-400"
											fill="currentColor"
											viewBox="0 0 20 20">
											<path
												d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
										</svg>
										<span class="text-sm text-gray-600">{{ nutritionist.rating }}</span>
									</div>
									<button
										class="rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors duration-300 hover:bg-green-700">
										Consultar
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Specializations -->
				<div class="mb-16">
					<h2 class="mb-12 text-center text-3xl font-bold text-white">Especializaciones</h2>
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
						<div
							v-for="specialization in specializations"
							:key="specialization.name"
							class="group cursor-pointer text-center">
							<div
								class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl transition-transform duration-300 group-hover:scale-110">
								<Icon :name="specialization.icon" />
							</div>
							<h3 class="mb-2 font-bold text-white transition-colors duration-300">
								{{ specialization.name }}
							</h3>
							<p class="text-sm text-neutral-300">{{ specialization.description }}</p>
						</div>
					</div>
				</div>

				<!-- Process Section -->
				<div class="mb-16">
					<h2 class="mb-12 text-center text-3xl font-bold text-white">Nuestro Proceso</h2>
					<div class="grid grid-cols-1 gap-8 md:grid-cols-4">
						<div class="transform text-center transition-transform duration-300 hover:scale-105">
							<div
								class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl">
								<span class="text-2xl font-bold">1</span>
							</div>
							<h3 class="mb-2 text-lg font-bold text-white">Evaluación Inicial</h3>
							<p class="text-sm text-neutral-300">
								Análisis completo de tu estado nutricional, objetivos y historial deportivo.
							</p>
						</div>

						<div class="transform text-center transition-transform duration-300 hover:scale-105">
							<div
								class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl">
								<span class="text-2xl font-bold">2</span>
							</div>
							<h3 class="mb-2 text-lg font-bold text-white">Plan Personalizado</h3>
							<p class="text-sm text-neutral-300">
								Diseño de un plan nutricional específico para tus necesidades y metas.
							</p>
						</div>

						<div class="transform text-center transition-transform duration-300 hover:scale-105">
							<div
								class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl">
								<span class="text-2xl font-bold">3</span>
							</div>
							<h3 class="mb-2 text-lg font-bold text-white">Implementación</h3>
							<p class="text-sm text-neutral-300">
								Acompañamiento en la implementación del plan con apoyo constante.
							</p>
						</div>

						<div class="transform text-center transition-transform duration-300 hover:scale-105">
							<div
								class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl">
								<span class="text-2xl font-bold">4</span>
							</div>
							<h3 class="mb-2 text-lg font-bold text-white">Seguimiento</h3>
							<p class="text-sm text-neutral-300">
								Monitoreo continuo y ajustes para optimizar tus resultados.
							</p>
						</div>
					</div>
				</div>

				<!-- CTA Section -->
				<div
					class="rounded-2xl bg-gradient-to-r from-neutral-700 to-neutral-800 p-8 text-center text-white md:p-12">
					<h2 class="mb-6 text-3xl font-bold md:text-4xl">¿Listo para optimizar tu nutrición?</h2>
					<p class="mb-8 text-xl opacity-90">
						Comienza tu transformación nutricional con el apoyo de nuestros expertos certificados
					</p>
					<div class="flex flex-col justify-center gap-4 sm:flex-row">
						<button
							class="transform rounded-full bg-white px-8 py-4 font-bold text-black transition duration-300 hover:scale-105 hover:bg-gray-100">
							Agendar Consulta
						</button>
						<NuxtLink
							to="/register"
							class="rounded-full border-2 border-white bg-transparent px-8 py-4 font-bold text-white transition-colors duration-300 hover:bg-white hover:text-black">
							Únete Ahora
						</NuxtLink>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup>
	definePageMeta({
		title: "Nutricionistas Deportivos - EliteHub",
		description: "Optimiza tu rendimiento con la guía de expertos en nutrición deportiva",
	});

	const { getContent } = useContent();

	const pageContent = ref({
		title: "",
		subtitle: "",
		content: "",
		metadata: {},
	});

	const nutritionists = ref([
		{
			name: "Dra. María González",
			initials: "MG",
			specialty: "Nutrición Deportiva",
			description:
				"Especialista en nutrición para deportes de resistencia con 10 años de experiencia.",
			rating: "4.9",
		},
		{
			name: "Dr. Carlos Ruiz",
			initials: "CR",
			specialty: "Suplementación",
			description: "Experto en suplementación deportiva y optimización del rendimiento.",
			rating: "4.8",
		},
		{
			name: "Lic. Ana Martínez",
			initials: "AM",
			specialty: "Composición Corporal",
			description: "Especializada en cambios de composición corporal para atletas.",
			rating: "4.9",
		},
		{
			name: "Dr. Luis Fernández",
			initials: "LF",
			specialty: "Deportes de Fuerza",
			description: "Nutricionista especializado en deportes de fuerza y potencia.",
			rating: "4.7",
		},
		{
			name: "Lic. Carmen López",
			initials: "CL",
			specialty: "Nutrición Clínica",
			description: "Experta en nutrición clínica aplicada al deporte de alto rendimiento.",
			rating: "4.8",
		},
		{
			name: "Dr. Roberto Silva",
			initials: "RS",
			specialty: "Deportes de Equipo",
			description: "Especialista en nutrición para deportes de equipo y colectivos.",
			rating: "4.9",
		},
	]);

	const specializations = ref([
		{
			name: "Resistencia",
			icon: "fa6-solid:person-running",
			description: "Nutrición para deportes de larga duración",
		},
		{
			name: "Fuerza",
			icon: "fa6-solid:weight-hanging",
			description: "Optimización para deportes de potencia",
		},
		{
			name: "Recuperación",
			icon: "solar:moon-sleep-bold",
			description: "Estrategias nutricionales de recuperación",
		},
		{
			name: "Hidratación",
			icon: "fa6-solid:water",
			description: "Planes de hidratación personalizados",
		},
		{
			name: "Peso Corporal",
			icon: "hugeicons:court-law",
			description: "Manejo saludable del peso corporal",
		},
		{
			name: "Suplementos",
			icon: "hugeicons:prescription",
			description: "Asesoría en suplementación deportiva",
		},
		{
			name: "Vegetariana",
			icon: "fa6-solid:leaf",
			description: "Nutrición plant-based para atletas",
		},
		{
			name: "Competición",
			icon: "fa6-solid:trophy",
			description: "Estrategias para días de competición",
		},
	]);

	const handleContentUpdate = (updatedContent) => {
		pageContent.value = updatedContent;
	};

	// Load content on mount
	onMounted(async () => {
		try {
			const content = await getContent("nutricionistas");
			pageContent.value = content;
		} catch (error) {
			console.error("Error loading content:", error);
		}
	});
</script>

<style scoped></style>
