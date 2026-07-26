<template>
	<div class="w-full min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
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

				<!-- Directorio de Nutricionistas -->
				<InfiniteScrollList :fetch-page="fetchPage">
					<template #default="{ item }">
						<UsuarioDirectoryCard :usuario="item" />
					</template>
					<template #empty>
						<p class="text-center text-gray-600">Todavía no hay nutricionistas registrados.</p>
					</template>
				</InfiniteScrollList>
			</div>
		</section>
	</div>
</template>

<script setup>
	definePageMeta({
		title: "Nutricionistas Deportivos - EliteHub",
		description: "Optimiza tu rendimiento con la guía de expertos en nutrición deportiva",
		keepalive: true,
	});

	const { getContent } = useContent();

	const pageContent = ref({
		title: "",
		subtitle: "",
		content: "",
		metadata: {},
	});

	function fetchPage(cursor) {
		return $fetch('/api/usuarios', { query: { tipo: 'Nutricionista', cursor } })
	}

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
