<template>
  <div class="w-full min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
    <div class="max-w-3xl mx-auto py-12 px-4">
    <h1 class="text-2xl font-bold mb-6">Crear Usuario</h1>

    <div v-if="!authStore.user?.isAdmin" class="p-6 bg-yellow-50 rounded">Solo administradores pueden crear usuarios.</div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Nombre</label>
        <input v-model="nombre" class="w-full border rounded px-3 py-2" required />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Apellido</label>
        <input v-model="apellido" class="w-full border rounded px-3 py-2" required />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Correo</label>
        <input v-model="correo" type="email" class="w-full border rounded px-3 py-2" required />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Contraseña</label>
        <input v-model="password" type="password" class="w-full border rounded px-3 py-2" required />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Rol</label>
        <select v-model="isAdmin" class="w-full border rounded px-3 py-2">
          <option :value="false">Usuario</option>
          <option :value="true">Administrador</option>
        </select>
      </div>

          <div class="flex items-center gap-3">
            <input id="activo" type="checkbox" v-model="activo" class="w-4 h-4" />
            <label for="activo" class="text-sm">Activo</label>
          </div>

      <div class="flex items-center gap-4">
        <button :disabled="loading" class="bg-green-400 hover:bg-green-500 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors">Crear</button>
        <NuxtLink to="/admin/users" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors inline-block">Cancelar</NuxtLink>
      </div>

      <div v-if="error" class="text-red-600">{{ error }}</div>
      <div v-if="success" class="text-green-600">Usuario creado correctamente.</div>
    </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const nombre = ref('')
const apellido = ref('')
const correo = ref('')
const password = ref('')
const isAdmin = ref(false)
const activo = ref(true)
const loading = ref(false)
const error = ref('')
const success = ref(false)

async function handleSubmit() {
  error.value = ''
  success.value = false
  if (!authStore.user?.isAdmin) {
    error.value = 'No autorizado'
    return
  }

  loading.value = true
  try {
    const res = await $fetch('/api/admin/users', {
      method: 'POST',
      body: { nombre: nombre.value, apellido: apellido.value, correo: correo.value, password: password.value, isAdmin: isAdmin.value, activo: activo.value }
    })
    success.value = true
    nombre.value = ''
    apellido.value = ''
    correo.value = ''
    password.value = ''
    isAdmin.value = false
    activo.value = true
  } catch (err: any) {
    console.error(err)
    error.value = err?.data?.message || err?.message || 'Error al crear usuario'
  } finally {
    loading.value = false
  }
}
</script>
