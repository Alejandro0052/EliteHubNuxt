<template>
  <div class="max-w-3xl mx-auto py-12 px-4">
    <h1 class="text-2xl font-bold mb-6">Crear Noticia</h1>

    <div v-if="!authStore.user?.isAdmin" class="p-6 bg-yellow-50 rounded">Solo administradores pueden crear noticias.</div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Título</label>
        <input v-model="titulo" class="w-full border rounded px-3 py-2" required />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Resumen</label>
        <input v-model="resumen" class="w-full border rounded px-3 py-2" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Contenido (HTML permitido)</label>
        <textarea v-model="contenido" rows="8" class="w-full border rounded px-3 py-2"></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Imagen</label>
        <input ref="fileInput" type="file" accept="image/*" />
      </div>

      <div class="flex items-center gap-4">
        <button :disabled="loading" class="bg-green-400 hover:bg-green-500 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors">Crear</button>
        <NuxtLink to="/noticias" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors inline-block">Cancelar</NuxtLink>
      </div>

      <div v-if="error" class="text-red-600">{{ error }}</div>
      <div v-if="success" class="text-green-600">Noticia creada correctamente.</div>
    </form>
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
const fileInput = ref<HTMLInputElement | null>(null)
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

  const fd = new FormData()
  fd.append('titulo', titulo.value)
  fd.append('resumen', resumen.value || '')
  fd.append('contenido', contenido.value || '')

  const fileEl = fileInput.value
  if (fileEl?.files?.[0]) {
    fd.append('imageFile', fileEl.files[0])
  }

  loading.value = true
  try {
    const res = await $fetch('/api/noticias', { method: 'POST', body: fd })
    success.value = true
    // redirect to news listing or the created item if id returned
    await router.push('/noticias')
  } catch (e: any) {
    console.error(e)
    error.value = e?.message || 'Error al crear noticia'
  } finally {
    loading.value = false
  }
}
</script>
