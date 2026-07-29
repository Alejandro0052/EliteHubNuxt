<template>
	<div class="w-full min-h-screen bg-surface-container dark:bg-surface-container-dark">
	<div class="mx-auto w-full max-w-[120rem] px-4 py-6">
		<div class="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
			<h1 class="mb-6 text-2xl font-bold text-gray-800 dark:text-white">Mi Perfil</h1>

			<!-- Admin quick link -->
			<div v-if="authStore.user?.isAdmin" class="mb-6">
				<NuxtLink to="/admin/users" class="button-secondary inline-flex items-center gap-2 px-3 py-2 text-sm font-medium">
					<Icon name="fa6-solid:users" />
					Gestión de usuarios
				</NuxtLink>
			</div>

			<!-- Mi catálogo (solo Marca) -->
			<div v-if="usuario?.informacion?.tipoUsuario?.tipo === 'Marca'" class="mb-6 rounded-lg bg-gray-50 p-6 dark:bg-neutral-700">
				<h2 class="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">Mi catálogo</h2>
				<NuxtLink to="/catalogo/create" class="button-primary inline-flex items-center gap-2 px-3 py-2 text-sm font-medium">
					<Icon name="fa6-solid:plus" />
					Agregar ítem
				</NuxtLink>
			</div>

			<div v-if="loading" class="dark:text-gray-300">Cargando...</div>

			<ProfileEditForm v-else-if="usuario" :usuario="usuario" :submitting="isLoading" @submit="handleSubmit" />

			<div v-if="successMessage" class="mt-4 rounded border border-green-400 bg-green-100 p-4 text-green-700 dark:border-green-600 dark:bg-green-900 dark:text-green-200">
				{{ successMessage }}
			</div>
		</div>
	</div>
	</div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const usuario = ref<any>(null)
const loading = ref(true)
const isLoading = ref(false)
const successMessage = ref('')

async function loadUserData() {
	try {
		await authStore.checkAuth()
		if (!authStore.isAuthenticated || !authStore.user) {
			navigateTo('/login')
			return
		}
		usuario.value = await $fetch('/api/profile', { headers: useRequestHeaders(['cookie']) })
	} catch (error) {
		console.error('Error al cargar los datos del usuario:', error)
	} finally {
		loading.value = false
	}
}

loadUserData()

async function handleSubmit(payload: Record<string, any>) {
	isLoading.value = true
	successMessage.value = ''
	try {
		await $fetch('/api/profile', { method: 'PUT', body: payload })
		successMessage.value = 'Perfil actualizado correctamente.'
		await authStore.checkAuth()
		await loadUserData()
	} catch (err) {
		console.error('Error updating profile', err)
	} finally {
		isLoading.value = false
	}
}
</script>
