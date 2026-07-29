<template>
	<div class="w-full min-h-screen bg-surface-container py-12 px-4 dark:bg-surface-container-dark">
		<button @click="goBack" class="button-secondary px-4 py-2 mb-6 flex items-center gap-2">
			<Icon name="fa6-solid:arrow-left" />
			<span>Volver</span>
		</button>

		<div v-if="loading">Cargando...</div>
		<div v-else-if="!usuario">No se encontró este deportista.</div>
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
