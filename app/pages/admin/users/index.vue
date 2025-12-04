<template>
  <div class="max-w-5xl mx-auto py-12 px-4">
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-3xl font-bold text-gray-900">Usuarios</h1>
      <div class="flex items-center gap-3">
        <NuxtLink to="/profile" class="inline-flex items-center gap-2 rounded-md bg-blue-400 hover:bg-blue-500 px-3 py-2 text-sm font-medium text-white">
          <Icon name="fa6-solid:arrow-left" />
          Volver
        </NuxtLink>
        <NuxtLink to="/admin/users/create" class="inline-flex items-center gap-2 rounded-md bg-green-400 hover:bg-green-500 px-3 py-2 text-sm font-medium text-white">
          <Icon name="fa6-solid:user-plus" />
          Crear Usuario
        </NuxtLink>
      </div>
    </div>

    <div v-if="loading">Cargando...</div>
    <div v-else>
      <table class="min-w-full table-auto divide-y divide-gray-200">
        <thead>
          <tr class="bg-gray-50">
            <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Nombre</th>
            <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Apellido</th>
            <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Correo</th>
            <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Rol</th>
            <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Activo</th>
            <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Creado</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="u in users" :key="u.id">
            <td class="px-4 py-3">{{ u.nombre }}</td>
            <td class="px-4 py-3">{{ u.apellido }}</td>
            <td class="px-4 py-3">{{ u.correo }}</td>
            <td class="px-4 py-3">{{ u.isAdmin ? 'Administrador' : 'Usuario' }}</td>
            <td class="px-4 py-3">
              <span v-if="u.activo" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Sí</span>
              <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">No</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ formatDate(u.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const users = ref<any[]>([])
const loading = ref(true)

function formatDate(d: string) {
  return new Date(d).toLocaleString()
}

onMounted(async () => {
  try {
    await authStore.checkAuth()
    users.value = await $fetch('/api/admin/users')
  } catch (err) {
    console.error('Failed to load users', err)
  } finally {
    loading.value = false
  }
})
</script>
