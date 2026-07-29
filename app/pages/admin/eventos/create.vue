<template>
  <div class="w-full min-h-screen bg-surface-container dark:bg-surface-container-dark">
    <div class="max-w-page-shell mx-auto py-12 px-4">
    <div class="max-w-3xl mx-auto dark:text-white">
    <h1 class="text-2xl font-bold mb-6">Crear Evento</h1>

    <div v-if="!authStore.isAuthenticated" class="p-6 bg-yellow-50 rounded dark:text-gray-900">Debes iniciar sesión para crear un evento.</div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Título</label>
        <input v-model="titulo" class="w-full border rounded px-3 py-2 dark:border-gray-600 dark:bg-neutral-700" required />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Resumen</label>
        <input v-model="resumen" class="w-full border rounded px-3 py-2 dark:border-gray-600 dark:bg-neutral-700" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Fecha del evento</label>
        <input v-model="fechaEvento" type="date" class="w-full border rounded px-3 py-2 dark:border-gray-600 dark:bg-neutral-700" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Ubicación</label>
        <input v-model="ubicacion" class="w-full border rounded px-3 py-2 dark:border-gray-600 dark:bg-neutral-700" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Contenido</label>
        <textarea v-model="contenido" rows="6" class="w-full border rounded px-3 py-2 dark:border-gray-600 dark:bg-neutral-700"></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Imagen</label>
        <input ref="fileInput" type="file" accept="image/*" />
      </div>

      <div class="flex items-center gap-4">
        <button :disabled="loading" class="button-primary px-6 py-2 font-semibold">Crear</button>
        <NuxtLink to="/eventos" replace class="button-secondary px-6 py-2 font-semibold inline-block">Cancelar</NuxtLink>
      </div>

      <div v-if="error" class="text-red-600">{{ error }}</div>
      <div v-if="success" class="text-green-600">Evento creado correctamente.</div>
    </form>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const titulo = ref('')
const resumen = ref('')
const contenido = ref('')
const fechaEvento = ref('')
const ubicacion = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const error = ref('')
const success = ref(false)

async function handleSubmit() {
  error.value = ''
  success.value = false
  if (!authStore.isAuthenticated) {
    error.value = 'Debes iniciar sesión para crear un evento.'
    return
  }

  const fd = new FormData()
  fd.append('titulo', titulo.value)
  fd.append('resumen', resumen.value || '')
  fd.append('contenido', contenido.value || '')
  fd.append('fechaEvento', fechaEvento.value || '')
  fd.append('ubicacion', ubicacion.value || '')

  const fileEl = fileInput.value
  if (fileEl?.files?.[0]) {
    fd.append('imageFile', fileEl.files[0])
  }

  loading.value = true
  try {
    const res = await $fetch('/api/eventos', { method: 'POST', body: fd })
    success.value = true
    await router.push('/eventos')
  } catch (e: any) {
    console.error(e)
    error.value = e?.message || 'Error al crear evento'
  } finally {
    loading.value = false
  }
}
</script>
