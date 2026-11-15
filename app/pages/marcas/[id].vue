<template>
	<div class="w-full min-h-screen bg-surface-container px-4 pt-8 pb-16 sm:px-6 lg:px-8 dark:bg-surface-container-dark">
		<button type="button" @click="goBack" class="button-secondary px-4 py-2 mb-6 flex items-center gap-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
			<Icon name="fa6-solid:arrow-left" />
			<span>Volver</span>
		</button>

		<div v-if="loading" class="text-on-surface-variant dark:text-on-surface-variant-dark">Cargando...</div>
		<div v-else-if="!usuario" class="text-on-surface-variant dark:text-on-surface-variant-dark">No se encontró esta marca.</div>
		<template v-else>
			<UsuarioDetailView :usuario="usuario" />

			<div v-if="usuario.informacion?.tipoUsuario?.tipo === 'Marca'" class="mx-auto mt-12 max-w-5xl">
				<h2 class="mb-5 border-b-2 border-on-surface pb-3 font-display text-4xl leading-none font-extrabold text-on-surface uppercase dark:border-on-surface-dark dark:text-on-surface-dark">Catálogo</h2>
				<div v-if="itemsCatalogo.length === 0" class="text-on-surface-variant dark:text-on-surface-variant-dark">
					Todavía no tiene ítems en su catálogo.
				</div>
				<div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
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
