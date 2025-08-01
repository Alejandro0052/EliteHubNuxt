<template>
	<div class="min-h-screen w-full">
		<!-- Content Editor for Admins -->
		<ContentEditor page="marcas" :initial-content="pageContent" @updated="handleContentUpdate" />

		<!-- Hero Section -->
		<section class="relative px-4 py-20 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-7xl">
				<div class="text-center">
					<h1 class="mb-6 text-4xl font-bold text-white md:text-6xl">
						{{ pageContent.title || "Marcas Deportivas" }}
					</h1>
					<p class="mx-auto mb-8 max-w-3xl text-xl text-white md:text-2xl">
						{{
							pageContent.subtitle ||
							"Descubre las mejores marcas deportivas y encuentra el equipamiento perfecto para tu rendimiento"
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

				<!-- Featured Brands -->
				<div class="mb-16">
					<h2 class="mb-12 text-center text-3xl font-bold text-white">Marcas Destacadas</h2>
					<div class="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
						<div v-for="brand in featuredBrands" :key="brand.name" class="group cursor-pointer">
							<div
								class="rounded-xl bg-white p-6 shadow-lg transition-all duration-300 group-hover:scale-105 hover:shadow-xl">
								<div
									class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black text-3xl text-white">
									<Icon :name="brand.icon" />
								</div>
								<p
									class="text-center text-sm font-medium text-gray-700 transition-colors duration-300 group-hover:text-black">
									{{ brand.name }}
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Categories -->
				<div class="mb-16">
					<h2 class="mb-12 text-center text-3xl font-bold text-white">Categorías de Productos</h2>
					<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
						<div
							class="transform overflow-hidden rounded-xl bg-white shadow-lg transition-transform duration-300 hover:scale-105">
							<div
								class="flex h-48 items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-5xl text-white">
								<Icon name="fa6-solid:bolt" />
							</div>
							<div class="p-6">
								<h3 class="mb-3 text-xl font-bold text-gray-900">Ropa Deportiva</h3>
								<p class="mb-4 text-gray-600">
									Encuentra la mejor indumentaria deportiva para cada disciplina y ocasión.
								</p>
								<button
									class="font-semibold text-blue-600 transition-colors duration-300 hover:text-blue-800">
									Ver Productos →
								</button>
							</div>
						</div>

						<div
							class="transform overflow-hidden rounded-xl bg-white shadow-lg transition-transform duration-300 hover:scale-105">
							<div
								class="flex h-48 items-center justify-center bg-gradient-to-br from-green-400 to-green-600 text-5xl text-white">
								<Icon name="fa6-solid:shoe-prints" />
							</div>
							<div class="p-6">
								<h3 class="mb-3 text-xl font-bold text-gray-900">Calzado Deportivo</h3>
								<p class="mb-4 text-gray-600">
									Calzado especializado para cada deporte con la mejor tecnología y comodidad.
								</p>
								<button
									class="font-semibold text-green-600 transition-colors duration-300 hover:text-green-800">
									Ver Productos →
								</button>
							</div>
						</div>

						<div
							class="transform overflow-hidden rounded-xl bg-white shadow-lg transition-transform duration-300 hover:scale-105">
							<div
								class="flex h-48 items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600 text-5xl text-white">
								<Icon name="fa6-solid:toolbox" />
							</div>
							<div class="p-6">
								<h3 class="mb-3 text-xl font-bold text-gray-900">Equipamiento</h3>
								<p class="mb-4 text-gray-600">
									Accesorios y equipamiento profesional para maximizar tu rendimiento.
								</p>
								<button
									class="font-semibold text-purple-600 transition-colors duration-300 hover:text-purple-800">
									Ver Productos →
								</button>
							</div>
						</div>

						<div
							class="transform overflow-hidden rounded-xl bg-white shadow-lg transition-transform duration-300 hover:scale-105">
							<div
								class="flex h-48 items-center justify-center bg-gradient-to-br from-red-400 to-red-600 text-5xl text-white">
								<Icon name="fa6-solid:heart" />
							</div>
							<div class="p-6">
								<h3 class="mb-3 text-xl font-bold text-gray-900">Suplementos</h3>
								<p class="mb-4 text-gray-600">
									Nutrición deportiva y suplementos para optimizar tu rendimiento.
								</p>
								<button
									class="font-semibold text-red-600 transition-colors duration-300 hover:text-red-800">
									Ver Productos →
								</button>
							</div>
						</div>

						<div
							class="transform overflow-hidden rounded-xl bg-white shadow-lg transition-transform duration-300 hover:scale-105">
							<div
								class="flex h-48 items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 text-5xl text-white">
								<Icon name="fa6-solid:mobile-screen" />
							</div>
							<div class="p-6">
								<h3 class="mb-3 text-xl font-bold text-gray-900">Tecnología</h3>
								<p class="mb-4 text-gray-600">
									Dispositivos y apps para monitorear y mejorar tu rendimiento deportivo.
								</p>
								<button
									class="font-semibold text-orange-600 transition-colors duration-300 hover:text-orange-800">
									Ver Productos →
								</button>
							</div>
						</div>

						<div
							class="transform overflow-hidden rounded-xl bg-white shadow-lg transition-transform duration-300 hover:scale-105">
							<div
								class="flex h-48 items-center justify-center bg-gradient-to-br from-indigo-400 to-indigo-600 text-5xl text-white">
								<Icon name="fa6-solid:stopwatch-20" />
							</div>
							<div class="p-6">
								<h3 class="mb-3 text-xl font-bold text-gray-900">Accesorios</h3>
								<p class="mb-4 text-gray-600">
									Complementos esenciales para completar tu equipamiento deportivo.
								</p>
								<button
									class="font-semibold text-indigo-600 transition-colors duration-300 hover:text-indigo-800">
									Ver Productos →
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- Benefits Section -->
				<div class="mb-16">
					<h2 class="mb-12 text-center text-3xl font-bold text-white">
						¿Por qué elegir nuestras marcas?
					</h2>
					<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
						<div class="transform text-center transition-transform duration-300 hover:scale-105">
							<div
								class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black text-3xl text-white">
								<Icon name="fa6-solid:check" />
							</div>
							<h3 class="mb-2 text-lg font-bold text-white">Calidad Garantizada</h3>
							<p class="text-sm text-neutral-300">
								Productos de las mejores marcas con garantía de calidad y durabilidad.
							</p>
						</div>

						<div class="transform text-center transition-transform duration-300 hover:scale-105">
							<div
								class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black text-3xl text-white">
								<Icon name="fa6-solid:clock" />
							</div>
							<h3 class="mb-2 text-lg font-bold text-white">Envío Rápido</h3>
							<p class="text-sm text-neutral-300">
								Entrega express en 24-48 horas para que no pares tu entrenamiento.
							</p>
						</div>

						<div class="transform text-center transition-transform duration-300 hover:scale-105">
							<div
								class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black text-3xl text-white">
								<Icon name="fa6-solid:money-bill" />
							</div>
							<h3 class="mb-2 text-lg font-bold text-white">Mejores Precios</h3>
							<p class="text-sm text-neutral-300">
								Precios competitivos y ofertas exclusivas para la comunidad EliteHub.
							</p>
						</div>

						<div class="transform text-center transition-transform duration-300 hover:scale-105">
							<div
								class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black text-3xl text-white">
								<Icon name="fa6-solid:user-tie" />
							</div>
							<h3 class="mb-2 text-lg font-bold text-white">Soporte Experto</h3>
							<p class="text-sm text-neutral-300">
								Asesoramiento personalizado de expertos en deportes y equipamiento.
							</p>
						</div>
					</div>
				</div>

				<!-- CTA Section -->
				<div
					class="rounded-2xl bg-gradient-to-r from-neutral-700 to-neutral-800 p-8 text-center text-white md:p-12">
					<h2 class="mb-6 text-3xl font-bold md:text-4xl">¿Buscas equipamiento de calidad?</h2>
					<p class="mb-8 text-xl opacity-90">
						Explora nuestro catálogo completo y encuentra todo lo que necesitas para alcanzar tus
						metas deportivas
					</p>
					<div class="flex flex-col justify-center gap-4 sm:flex-row">
						<button
							class="transform rounded-full bg-white px-8 py-4 font-bold text-black transition duration-300 hover:scale-105 hover:bg-gray-100">
							Ver Catálogo Completo
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
		title: "Marcas Deportivas - EliteHub",
		description:
			"Descubre las mejores marcas deportivas y encuentra el equipamiento perfecto para tu rendimiento",
	});

	const { getContent } = useContent();

	const pageContent = ref({
		title: "",
		subtitle: "",
		content: "",
		metadata: {},
	});

	const featuredBrands = ref([
		{ name: "Nike", icon: "simple-icons:nike" },
		{ name: "Adidas", icon: "simple-icons:adidas" },
		{ name: "Puma", icon: "simple-icons:puma" },
		{ name: "Under Armour", icon: "simple-icons:underarmour" },
		{ name: "Reebok", icon: "simple-icons:reebok" },
		{ name: "New Balance", icon: "simple-icons:newbalance" },
		{ name: "Apple", icon: "simple-icons:apple" },
		{ name: "Samsung", icon: "simple-icons:samsung" },
		{ name: "Xiaomi", icon: "simple-icons:xiaomi" },
		{ name: "Huawei", icon: "simple-icons:huawei" },
		{ name: "Garmin", icon: "simple-icons:garmin" },
	]);

	const handleContentUpdate = (updatedContent) => {
		pageContent.value = updatedContent;
	};

	// Load content on mount
	onMounted(async () => {
		try {
			const content = await getContent("marcas");
			pageContent.value = content;
		} catch (error) {
			console.error("Error loading content:", error);
		}
	});
</script>

<style scoped></style>
