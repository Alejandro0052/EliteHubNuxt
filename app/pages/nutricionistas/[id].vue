<template>
	<div class="w-full min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-12 px-4">
		<button @click="goBack" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mb-6 flex items-center gap-2 transition-colors">
			<Icon name="fa6-solid:arrow-left" />
			<span>Volver</span>
		</button>

		<div v-if="loading">Cargando...</div>
		<div v-else-if="!usuario">No se encontró este nutricionista.</div>
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
