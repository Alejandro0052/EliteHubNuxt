<template>
	<div class="w-full min-h-screen bg-surface-container py-12 px-4 dark:bg-surface-container-dark">
		<button @click="goBack" class="button-secondary px-4 py-2 mb-6 flex items-center gap-2">
			<Icon name="fa6-solid:arrow-left" />
			<span>Volver</span>
		</button>

		<div v-if="loading">Cargando...</div>
		<div v-else-if="!usuario">No se encontró esta marca.</div>
		<template v-else>
			<UsuarioDetailView :usuario="usuario" />

			<div v-if="usuario.informacion?.tipoUsuario?.tipo === 'Marca'" class="mx-auto mt-8 max-w-3xl">
				<h2 class="mb-4 text-2xl font-bold text-gray-900">Catálogo</h2>
				<div v-if="itemsCatalogo.length === 0" class="text-gray-600">
					Todavía no tiene ítems en su catálogo.
				</div>
				<div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					<CatalogoItemCard v-for="item in itemsCatalogo" :key="item.id" :item="item" />
				</div>
			</div>
		</template>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const usuario = ref(null)
const loading = ref(true)
const itemsCatalogo = ref([])

const goBack = () => {
	router.back()
}

onMounted(async () => {
	try {
		usuario.value = await $fetch('/api/usuarios/' + route.params.id)
		if (usuario.value?.informacion?.tipoUsuario?.tipo === 'Marca') {
			const catalogo = await $fetch('/api/catalogo', { query: { usuarioId: route.params.id } })
			itemsCatalogo.value = catalogo.items
		}
	} catch (err) {
		console.error(err)
	} finally {
		loading.value = false
	}
})
</script>
