<template>
	<div class="w-full min-h-screen bg-surface-container dark:bg-surface-container-dark">
		<div class="mx-auto max-w-page-shell px-4 pt-8 pb-16 sm:px-6 lg:px-8">
			<button
				type="button"
				class="button-secondary mb-8 flex items-center gap-2 px-4 py-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark"
				@click="goBack">
				<Icon name="fa6-solid:arrow-left" />
				<span>Volver</span>
			</button>

			<DirectoryHeader title="Catálogo" subtitle="Productos y servicios de las marcas de Elite Hub." />

			<nav aria-label="Filtrar por categoría" class="mt-4 mb-8">
				<FilterChips v-model="selectedCategoriaId" :options="categoriaOptions" variant="tabs" />
			</nav>

			<InfiniteScrollList
				:key="selectedCategoriaId ?? 'all'"
				:fetch-page="fetchPage"
				grid-class="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
				skeleton-class="aspect-[4/6]">
				<template #default="{ item }">
					<CatalogoItemCard :item="item" />
				</template>
				<template #empty>
					<p class="text-on-surface-variant dark:text-on-surface-variant-dark">
						{{ selectedCategoriaId ? 'Todavía no hay ítems en esta categoría. Prueba con otra o mira todos.' : 'Todavía no hay ítems en el catálogo.' }}
					</p>
				</template>
			</InfiniteScrollList>
		</div>
	</div>
</template>

<script setup>
definePageMeta({
	title: 'Catálogo - EliteHub',
	description: 'Productos y servicios de las marcas de Elite Hub.',
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
