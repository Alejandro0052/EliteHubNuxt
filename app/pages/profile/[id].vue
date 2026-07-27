<template>
	<div class="mx-auto w-full max-w-[120rem] px-4 py-6">
		<div class="rounded-lg bg-white p-6 shadow-md">
			<div v-if="!authStore.user?.isAdmin" class="rounded bg-yellow-50 p-6">No autorizado.</div>

			<template v-else>
				<NuxtLink
					to="/admin/users"
					class="mb-6 inline-flex items-center gap-2 rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600">
					<Icon name="fa6-solid:arrow-left" />
					Volver a Usuarios
				</NuxtLink>

				<div v-if="loading">Cargando...</div>

				<template v-else-if="usuario">
					<div class="mb-6 rounded-lg border-2 border-yellow-400 bg-yellow-50 p-4 text-yellow-800">
						<strong>Editando el perfil de {{ usuario.nombre }} {{ usuario.apellido }} como administrador</strong>
					</div>

					<ProfileEditForm :usuario="usuario" :submitting="isLoading" @submit="handleSubmit" />

					<div v-if="successMessage" class="mt-4 rounded border border-green-400 bg-green-100 p-4 text-green-700">
						{{ successMessage }}
					</div>
				</template>

				<div v-else>Usuario no encontrado.</div>
			</template>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const usuario = ref<any>(null)
const loading = ref(true)
const isLoading = ref(false)
const successMessage = ref('')

async function loadUserData() {
	loading.value = true
	try {
		await authStore.checkAuth()
		if (!authStore.user?.isAdmin) return
		usuario.value = await $fetch('/api/profile/' + route.params.id)
	} catch (error) {
		console.error('Error al cargar el perfil:', error)
	} finally {
		loading.value = false
	}
}

loadUserData()

async function handleSubmit(payload: Record<string, any>) {
	isLoading.value = true
	successMessage.value = ''
	try {
		await $fetch('/api/profile/' + route.params.id, { method: 'PUT', body: payload })
		successMessage.value = 'Perfil actualizado correctamente.'
		await loadUserData()
	} catch (err) {
		console.error('Error updating profile', err)
	} finally {
		isLoading.value = false
	}
}
</script>
