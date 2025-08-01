<template>
	<div class="min-h-screen w-full">
		<!-- Content Editor for Admins -->
		<ContentEditor
			page="deportistas"
			:initial-content="pageContent"
			@updated="handleContentUpdate" />

		<!-- Hero Section -->
		<section class="relative px-4 py-20 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-7xl">
				<div class="text-center">
					<h1 class="mb-6 text-4xl font-bold text-white md:text-6xl">
						{{ pageContent.title || "Deportistas Elite" }}
					</h1>
					<p class="mx-auto mb-8 max-w-3xl text-xl text-white md:text-2xl">
						{{
							pageContent.subtitle ||
							"Conecta con los mejores atletas y lleva tu rendimiento al siguiente nivel"
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
					<div v-html="pageContent.content"></div>
				</div>

				<!-- Features Grid -->
				<div class="mb-16 grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
					<div
						class="transform rounded-xl bg-white p-8 shadow-yellow-600/40 transition-transform duration-300 hover:scale-105 hover:shadow-lg">
						<div
							class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black text-3xl text-white">
							<Icon name="fa6-solid:bolt" />
						</div>
						<h3 class="mb-4 text-xl font-bold text-black">Rendimiento Elite</h3>
						<p class="text-gray-600">
							Accede a entrenamientos especializados y técnicas avanzadas para maximizar tu
							potencial deportivo.
						</p>
					</div>

					<div
						class="transform rounded-xl bg-white p-8 shadow-blue-600/40 transition-transform duration-300 hover:scale-105 hover:shadow-lg">
						<div
							class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black text-3xl text-white">
							<Icon name="fa6-solid:users" />
						</div>
						<h3 class="mb-4 text-xl font-bold text-gray-900">Comunidad Deportiva</h3>
						<p class="text-gray-600">
							Conecta con otros atletas, comparte experiencias y forma parte de una comunidad
							comprometida.
						</p>
					</div>

					<div
						class="transform rounded-xl bg-white p-8 shadow-red-600/40 transition-transform duration-300 hover:scale-105 hover:shadow-lg">
						<div
							class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black text-3xl text-white">
							<Icon name="fa6-solid:users" />
						</div>
						<h3 class="mb-4 text-xl font-bold text-gray-900">Seguimiento Personalizado</h3>
						<p class="text-gray-600">
							Monitorea tu progreso con herramientas avanzadas y recibe retroalimentación
							personalizada.
						</p>
					</div>
				</div>

				<!-- Sports Categories -->
				<div class="mb-16">
					<h2 class="mb-12 text-center text-3xl font-bold text-white">Categorías Deportivas</h2>
					<div class="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
						<div v-for="sport in sports" :key="sport.name" class="group text-center">
							<div
								class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl text-black shadow-md shadow-white/40 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg">
								<Icon :name="sport.icon" />
							</div>
							<p
								class="text-sm font-medium text-gray-400 transition-colors duration-300 group-hover:text-white">
								{{ sport.name }}
							</p>
						</div>
					</div>
				</div>

				<!-- CTA Section -->
				<div
					class="rounded-2xl border-white bg-gradient-to-r from-neutral-700 to-neutral-800 p-8 text-center text-white md:p-12">
					<h2 class="mb-6 text-3xl font-bold md:text-4xl">¿Listo para ser un deportista elite?</h2>
					<p class="mb-8 text-xl">
						Únete a nuestra plataforma y comienza tu transformación deportiva hoy mismo
					</p>
					<NuxtLink
						to="/register"
						class="inline-block transform rounded-full bg-white px-8 py-4 font-bold text-black transition duration-300 hover:scale-105 hover:bg-gray-100">
						Comenzar Ahora
					</NuxtLink>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup>
	definePageMeta({
		title: "Deportistas Elite - EliteHub",
		description: "Conecta con los mejores atletas y lleva tu rendimiento al siguiente nivel",
	});

	const { getContent } = useContent();

	const pageContent = ref({
		title: "",
		subtitle: "",
		content: "",
		metadata: {},
	});

	const sports = ref([
		{ name: "Fútbol", icon: "fa6-solid:futbol" },
		{ name: "Baloncesto", icon: "solar:basketball-bold" },
		{ name: "Tenis", icon: "solar:tennis-bold" },
		{ name: "Natación", icon: "solar:swimming-bold" },
		{ name: "Atletismo", icon: "solar:running-bold" },
		{ name: "Ciclismo", icon: "solar:bicycling-bold" },
		{ name: "Voleibol", icon: "solar:volleyball-bold" },
		{ name: "Gimnasia", icon: "hugeicons:gymnastic-rings" },
		{ name: "Boxeo", icon: "hugeicons:boxing-glove" },
		{ name: "Yoga", icon: "hugeicons:yoga-mat" },
		{ name: "CrossFit", icon: "mdi:crossfit" },
		{ name: "Más deportes", icon: "fa6-solid:trophy" },
	]);

	const handleContentUpdate = (updatedContent) => {
		pageContent.value = updatedContent;
	};

	// Load content on mount
	onMounted(async () => {
		try {
			const content = await getContent("deportistas");
			pageContent.value = content;
		} catch (error) {
			console.error("Error loading content:", error);
		}
	});
</script>

<style scoped></style>
