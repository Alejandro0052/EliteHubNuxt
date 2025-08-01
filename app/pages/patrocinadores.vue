<template>
	<div class="flex min-h-screen w-full flex-col">
		<!-- Content Editor for Admins -->
		<ContentEditor
			page="patrocinadores"
			:initial-content="pageContent"
			@updated="handleContentUpdate" />

		<!-- Hero Section -->
		<section class="relative flex-shrink-0 px-4 py-20 sm:px-6 lg:px-8">
			<div class="mx-auto w-full max-w-7xl">
				<div class="text-center">
					<h1 class="mb-6 text-4xl font-bold text-white md:text-6xl">
						{{ pageContent.title || "Patrocinadores Elite" }}
					</h1>
					<p class="mx-auto mb-8 max-w-3xl text-xl text-white md:text-2xl">
						{{
							pageContent.subtitle ||
							"Conecta tu marca con el talento deportivo y maximiza tu impacto en el mercado"
						}}
					</p>
				</div>
			</div>
		</section>

		<!-- Main Content -->
		<section class="flex-grow px-4 py-6 sm:px-6 lg:px-8">
			<div class="mx-auto w-full max-w-7xl">
				<!-- Custom Content -->
				<div v-if="pageContent.content" class="mb-16">
					<div class="prose max-w-none" v-html="pageContent.content"></div>
				</div>

				<!-- Benefits Grid -->
				<div class="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
					<div
						class="transform rounded-xl bg-white p-8 shadow-yellow-600/40 transition-transform duration-300 hover:scale-105 hover:shadow-lg">
						<div
							class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black text-3xl text-white">
							<Icon name="solar:course-up-bold" />
						</div>
						<h3 class="mb-4 text-xl font-bold text-gray-900">Alcance Masivo</h3>
						<p class="text-gray-600">
							Llega a miles de deportistas y aficionados comprometidos con el alto rendimiento y
							estilo de vida saludable.
						</p>
					</div>

					<div
						class="transform rounded-xl bg-white p-8 shadow-blue-600/40 transition-transform duration-300 hover:scale-105 hover:shadow-lg">
						<div
							class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black text-3xl text-white">
							<Icon name="solar:verified-check-bold" />
						</div>
						<h3 class="mb-4 text-xl font-bold text-gray-900">Audiencia Premium</h3>
						<p class="text-gray-600">
							Accede a una audiencia de alto valor adquisitivo interesada en productos y servicios
							de calidad.
						</p>
					</div>

					<div
						class="transform rounded-xl bg-white p-8 shadow-red-600/40 transition-transform duration-300 hover:scale-105 hover:shadow-lg">
						<div
							class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black text-3xl text-white">
							<Icon name="solar:presentation-graph-bold" />
						</div>
						<h3 class="mb-4 text-xl font-bold text-gray-900">ROI Medible</h3>
						<p class="text-gray-600">
							Obtén métricas detalladas y análisis de rendimiento para optimizar tu inversión
							publicitaria.
						</p>
					</div>
				</div>

				<!-- Sponsorship Packages -->
				<div class="mb-16">
					<h2 class="mb-12 text-center text-3xl font-bold text-white">Paquetes de Patrocinio</h2>
					<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
						<!-- Bronze Package -->
						<div
							class="flex transform flex-col gap-3 rounded-xl border-2 border-gray-200 bg-white p-8 shadow-lg transition-transform duration-300 hover:scale-105 hover:border-orange-400 hover:shadow-xl">
							<div class="flex flex-col gap-2 text-center">
								<h3 class="text-2xl font-bold text-gray-900">Bronce</h3>
								<div class="text-4xl font-bold text-orange-600">$50,000</div>
								<p class="text-gray-600">Perfecto para empezar</p>
							</div>
							<ul class="flex flex-grow flex-col justify-center gap-3 py-3">
								<li class="flex items-center gap-2">
									<Icon name="fa6-solid:check" class="text-orange-600" />
									Logo en página principal
								</li>
								<li class="flex items-center gap-2">
									<Icon name="fa6-solid:check" class="text-orange-600" />
									Mención en redes sociales
								</li>
								<li class="flex items-center gap-2">
									<Icon name="fa6-solid:check" class="text-orange-600" />
									Reporte mensual básico
								</li>
							</ul>
							<button
								class="w-full rounded-lg bg-orange-600 py-3 text-white transition-colors duration-300 hover:bg-orange-700">
								Seleccionar Plan
							</button>
						</div>

						<!-- Silver Package -->
						<div
							class="flex transform flex-col gap-3 rounded-xl border-2 border-blue-400 bg-white p-8 shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl">
							<div class="flex flex-col gap-2 text-center">
								<div class="rounded-full bg-blue-500 px-4 py-1 text-sm font-medium text-white">
									Más Popular
								</div>
								<h3 class="text-2xl font-bold text-gray-900">Plata</h3>
								<div class="text-4xl font-bold text-blue-600">$100,000</div>
								<p class="text-gray-600">Ideal para crecimiento</p>
							</div>
							<ul class="flex flex-grow flex-col justify-center gap-3 py-3">
								<li class="flex items-center gap-2">
									<Icon name="fa6-solid:check" class="text-blue-600" />
									Todo lo del plan Bronce
								</li>
								<li class="flex items-center gap-2">
									<Icon name="fa6-solid:check" class="text-blue-600" />
									Banner destacado
								</li>
								<li class="flex items-center gap-2">
									<Icon name="fa6-solid:check" class="text-blue-600" />
									Newsletter semanal
								</li>
								<li class="flex items-center gap-2">
									<Icon name="fa6-solid:check" class="text-blue-600" />
									Análisis detallado
								</li>
							</ul>
							<button
								class="w-full rounded-lg bg-blue-600 py-3 text-white transition-colors duration-300 hover:bg-blue-700">
								Seleccionar Plan
							</button>
						</div>

						<!-- Gold Package -->
						<div
							class="flex transform flex-col gap-3 rounded-xl border-2 border-gray-200 bg-white p-8 shadow-lg transition-transform duration-300 hover:scale-105 hover:border-yellow-400">
							<div class="flex flex-col gap-2 text-center">
								<h3 class="text-2xl font-bold text-gray-900">Oro</h3>
								<div class="text-4xl font-bold text-yellow-600">$250,000</div>
								<p class="text-gray-600">Máxima exposición</p>
							</div>
							<ul class="flex flex-grow flex-col justify-center gap-3 py-3">
								<li class="flex items-center gap-2">
									<Icon name="fa6-solid:check" class="text-yellow-600" />
									Todo lo del plan Plata
								</li>
								<li class="flex items-center gap-2">
									<Icon name="fa6-solid:check" class="text-yellow-600" />
									Patrocinio de eventos
								</li>
								<li class="flex items-center gap-2">
									<Icon name="fa6-solid:check" class="text-yellow-600" />
									Contenido personalizado
								</li>
								<li class="flex items-center gap-2">
									<Icon name="fa6-solid:check" class="text-yellow-600" />
									Soporte dedicado
								</li>
							</ul>
							<button
								class="w-full rounded-lg bg-yellow-600 py-3 text-white transition-colors duration-300 hover:bg-yellow-700">
								Seleccionar Plan
							</button>
						</div>
					</div>
				</div>

				<!-- CTA Section -->
				<div
					class="rounded-2xl bg-gradient-to-r from-neutral-700 to-neutral-800 p-8 text-center text-white md:p-12">
					<h2 class="mb-6 text-3xl font-bold md:text-4xl">¿Listo para impulsar tu marca?</h2>
					<p class="mb-8 text-xl opacity-90">
						Únete a las marcas líderes que confían en EliteHub para conectar con su audiencia
						objetivo
					</p>
					<div class="flex flex-col justify-center gap-4 sm:flex-row">
						<NuxtLink
							to="/contactUs"
							class="inline-block transform rounded-full bg-white px-8 py-4 font-bold text-black transition duration-300 hover:scale-105 hover:bg-gray-100">
							Contactar Ahora
						</NuxtLink>
						<button
							class="rounded-full border-2 border-white bg-transparent px-8 py-4 font-bold text-white transition-colors duration-300 hover:bg-white hover:text-black">
							Ver Casos de Éxito
						</button>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup>
	definePageMeta({
		title: "Patrocinadores - EliteHub",
		description: "Conecta tu marca con el talento deportivo y maximiza tu impacto en el mercado",
	});

	const { getContent } = useContent();

	const pageContent = ref({
		title: "",
		subtitle: "",
		content: "",
		metadata: {},
	});

	const handleContentUpdate = (updatedContent) => {
		pageContent.value = updatedContent;
	};

	// Load content on mount
	onMounted(async () => {
		try {
			const content = await getContent("patrocinadores");
			pageContent.value = content;
		} catch (error) {
			console.error("Error loading content:", error);
		}
	});
</script>

<style scoped></style>
