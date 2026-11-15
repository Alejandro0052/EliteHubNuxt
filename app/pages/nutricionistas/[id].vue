<template>
	<div class="w-full min-h-screen bg-surface-container px-4 pt-8 pb-16 sm:px-6 lg:px-8 dark:bg-surface-container-dark">
		<button type="button" @click="goBack" class="button-secondary px-4 py-2 mb-6 flex items-center gap-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
			<Icon name="fa6-solid:arrow-left" />
			<span>Volver</span>
		</button>

		<div v-if="loading" class="text-on-surface-variant dark:text-on-surface-variant-dark">Cargando...</div>
		<div v-else-if="!usuario" class="text-on-surface-variant dark:text-on-surface-variant-dark">No se encontró este nutricionista.</div>
		<UsuarioDetailView v-else :usuario="usuario" />
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const usuario = ref(null)
const loading = ref(true)

const goBack = () => {
	router.back()
}

onMounted(async () => {
	try {
		usuario.value = await $fetch('/api/usuarios/' + route.params.id)
	} catch (err) {
		console.error(err)
	} finally {
		loading.value = false
	}
})
</script>
