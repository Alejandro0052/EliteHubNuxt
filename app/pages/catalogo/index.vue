<template>
	<div class="w-full min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
		<div class="px-4 pt-8 sm:px-6 lg:px-8">
			<button @click="goBack" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
				<Icon name="fa6-solid:arrow-left" />
				<span>Volver</span>
			</button>
		</div>

		<section class="relative px-4 py-20 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-7xl text-center">
				<h1 class="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">Catálogo</h1>
				<p class="mx-auto max-w-3xl text-xl text-gray-600">
					Descubre productos y servicios de todas las marcas de EliteHub.
				</p>
			</div>
		</section>

		<section class="px-4 py-16 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-7xl">
				<div class="mb-6">
					<FilterChips v-model="selectedCategoriaId" :options="categoriaOptions" />
				</div>

				<InfiniteScrollList :key="selectedCategoriaId ?? 'all'" :fetch-page="fetchPage">
					<template #default="{ item }">
						<CatalogoItemCard :item="item" />
					</template>
					<template #empty>
						<p class="text-center text-gray-600">Todavía no hay ítems en el catálogo.</p>
					</template>
				</InfiniteScrollList>
			</div>
		</section>
	</div>
</template>

<script setup>
definePageMeta({
	title: 'Catálogo - EliteHub',
	description: 'Descubre productos y servicios de todas las marcas de EliteHub',
	keepalive: true,
})

const router = useRouter()

function goBack() {
	router.back()
}

const categorias = ref([])
const selectedCategoriaId = ref(null)
const categoriaOptions = computed(() => [
	{ value: null, label: 'Todos' },
	...categorias.value.map((c) => ({ value: c.id, label: c.nombre })),
])

function fetchPage(cursor) {
	return $fetch('/api/catalogo', {
		query: { cursor, categoriaId: selectedCategoriaId.value || undefined },
	})
}

onMounted(async () => {
	try {
		categorias.value = await $fetch('/api/categorias-catalogo')
	} catch (error) {
		console.error('Error loading categorias:', error)
	}
})
</script>
