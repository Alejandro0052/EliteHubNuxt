<template>
	<div class="w-full min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
		<!-- Content Editor for Admins -->
		<ContentEditor
			page="nutricionistas"
			:initial-content="pageContent"
			@updated="handleContentUpdate" />

		<!-- Hero Section -->
		<section class="relative px-4 py-20 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-7xl">
				<div class="text-center">
					<h1 class="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
						{{ pageContent.title || "Nutricionistas Deportivos" }}
					</h1>
					<p class="mx-auto mb-8 max-w-3xl text-xl text-gray-600 md:text-2xl">
						{{
							pageContent.subtitle ||
							"Optimiza tu rendimiento con la guía de expertos en nutrición deportiva"
						}}
					</p>
				</div>
			</div>
		</section>

		<!-- Main Content -->
		<section class="px-4 py-16 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-7xl">
				<!-- Custom Content -->
				<div v-if="pageContent.content" class="mb-16">
					<div class="max-w-none" v-html="pageContent.content"></div>
				</div>

				<!-- Services Grid -->
				<div class="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
					<div
						class="rounded-xl bg-white p-8 shadow-lg transition-transform duration-300 transform hover:scale-105">
						<div class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
							<svg
								class="h-8 w-8 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
							</svg>
						</div>
						<h3 class="mb-4 text-xl font-bold text-gray-900">Planes Personalizados</h3>
						<p class="text-gray-600">
							Diseñamos planes nutricionales específicos para tu deporte, objetivos y necesidades
							individuales.
						</p>
					</div>

					<div
						class="rounded-xl bg-white p-8 shadow-lg transition-transform duration-300 transform hover:scale-105">
						<div class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
							<svg
								class="h-8 w-8 text-blue-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
							</svg>
						</div>
						<h3 class="mb-4 text-xl font-bold text-gray-900">Seguimiento Continuo</h3>
						<p class="text-gray-600">
							Monitoreo constante de tu progreso con ajustes regulares para optimizar resultados.
						</p>
					</div>

					<div
						class="rounded-xl bg-white p-8 shadow-lg transition-transform duration-300 transform hover:scale-105">
						<div class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
							<svg
								class="h-8 w-8 text-purple-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
							</svg>
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
					<h2 class="mb-12 text-center text-3xl font-bold text-gray-900">Nuestros Expertos</h2>
					<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
						<div
							v-for="nutritionist in nutritionists"
							:key="nutritionist.id"
							class="overflow-hidden rounded-xl bg-white shadow-lg transition-transform duration-300 transform hover:scale-105">
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
					<h2 class="mb-12 text-center text-3xl font-bold text-gray-900">Especializaciones</h2>
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
						<div
							v-for="specialization in specializations"
							:key="specialization.name"
							class="group cursor-pointer text-center">
							<div
								class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-500 transition-transform duration-300 group-hover:scale-110">
								<span class="text-2xl">{{ specialization.icon }}</span>
							</div>
							<h3
								class="mb-2 font-bold text-gray-900 transition-colors duration-300 group-hover:text-green-600">
								{{ specialization.name }}
							</h3>
							<p class="text-sm text-gray-600">{{ specialization.description }}</p>
						</div>
					</div>
				</div>

				<!-- Process Section -->
				<div class="mb-16">
					<h2 class="mb-12 text-center text-3xl font-bold text-gray-900">Nuestro Proceso</h2>
					<div class="grid grid-cols-1 gap-8 md:grid-cols-4">
						<div class="text-center transition-transform duration-300 transform hover:scale-105">
							<div
								class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
								<span class="text-2xl font-bold text-green-600">1</span>
							</div>
							<h3 class="mb-2 text-lg font-bold text-gray-900">Evaluación Inicial</h3>
							<p class="text-sm text-gray-600">
								Análisis completo de tu estado nutricional, objetivos y historial deportivo.
							</p>
						</div>

						<div class="text-center transition-transform duration-300 transform hover:scale-105">
							<div
								class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
								<span class="text-2xl font-bold text-blue-600">2</span>
							</div>
							<h3 class="mb-2 text-lg font-bold text-gray-900">Plan Personalizado</h3>
							<p class="text-sm text-gray-600">
								Diseño de un plan nutricional específico para tus necesidades y metas.
							</p>
						</div>

						<div class="text-center transition-transform duration-300 transform hover:scale-105">
							<div
								class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
								<span class="text-2xl font-bold text-purple-600">3</span>
							</div>
							<h3 class="mb-2 text-lg font-bold text-gray-900">Implementación</h3>
							<p class="text-sm text-gray-600">
								Acompañamiento en la implementación del plan con apoyo constante.
							</p>
						</div>

						<div class="text-center transition-transform duration-300 transform hover:scale-105">
							<div
								class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
								<span class="text-2xl font-bold text-orange-600">4</span>
							</div>
							<h3 class="mb-2 text-lg font-bold text-gray-900">Seguimiento</h3>
							<p class="text-sm text-gray-600">
								Monitoreo continuo y ajustes para optimizar tus resultados.
							</p>
						</div>
					</div>
				</div>

				<!-- CTA Section -->
				<div
					class="rounded-2xl bg-gradient-to-r from-green-600 to-teal-600 p-8 text-center text-white md:p-12">
					<h2 class="mb-6 text-3xl font-bold md:text-4xl">¿Listo para optimizar tu nutrición?</h2>
					<p class="mb-8 text-xl opacity-90">
						Comienza tu transformación nutricional con el apoyo de nuestros expertos certificados
					</p>
					<div class="flex flex-col justify-center gap-4 sm:flex-row">
						<button
							class="transform rounded-full bg-white px-8 py-4 font-bold text-green-600 transition-colors duration-300 hover:scale-105 hover:bg-gray-100">
							Agendar Consulta
						</button>
						<NuxtLink
							to="/register"
							class="rounded-full border-2 border-white bg-transparent px-8 py-4 font-bold text-white transition-colors duration-300 hover:bg-white hover:text-green-600">
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
			id: 1,
			name: "Dra. María González",
			initials: "MG",
			specialty: "Nutrición Deportiva",
			description:
				"Especialista en nutrición para deportes de resistencia con 10 años de experiencia.",
			rating: "4.9",
		},
		{
			id: 2,
			name: "Dr. Carlos Ruiz",
			initials: "CR",
			specialty: "Suplementación",
			description: "Experto en suplementación deportiva y optimización del rendimiento.",
			rating: "4.8",
		},
		{
			id: 3,
			name: "Lic. Ana Martínez",
			initials: "AM",
			specialty: "Composición Corporal",
			description: "Especializada en cambios de composición corporal para atletas.",
			rating: "4.9",
		},
		{
			id: 4,
			name: "Dr. Luis Fernández",
			initials: "LF",
			specialty: "Deportes de Fuerza",
			description: "Nutricionista especializado en deportes de fuerza y potencia.",
			rating: "4.7",
		},
		{
			id: 5,
			name: "Lic. Carmen López",
			initials: "CL",
			specialty: "Nutrición Clínica",
			description: "Experta en nutrición clínica aplicada al deporte de alto rendimiento.",
			rating: "4.8",
		},
		{
			id: 6,
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
			icon: "🏃",
			description: "Nutrición para deportes de larga duración",
		},
		{
			name: "Fuerza",
			icon: "🏋️",
			description: "Optimización para deportes de potencia",
		},
		{
			name: "Recuperación",
			icon: "💤",
			description: "Estrategias nutricionales de recuperación",
		},
		{
			name: "Hidratación",
			icon: "💧",
			description: "Planes de hidratación personalizados",
		},
		{
			name: "Peso Corporal",
			icon: "⚖️",
			description: "Manejo saludable del peso corporal",
		},
		{
			name: "Suplementos",
			icon: "💊",
			description: "Asesoría en suplementación deportiva",
		},
		{
			name: "Vegetariana",
			icon: "🥗",
			description: "Nutrición plant-based para atletas",
		},
		{
			name: "Competición",
			icon: "🏆",
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
