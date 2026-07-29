<template>
  <div class="w-full min-h-screen bg-surface-container dark:bg-surface-container-dark">
    <div class="max-w-page-shell mx-auto py-12 px-4">
    <div class="max-w-3xl mx-auto dark:text-white">
    <h1 class="text-2xl font-bold mb-6">Agregar ítem al catálogo</h1>

    <div v-if="tipoUsuarioActual !== 'Marca'" class="p-6 bg-yellow-50 rounded dark:text-gray-900">
      Solo los usuarios de tipo Marca pueden crear ítems de catálogo.
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Nombre</label>
        <input v-model="nombre" class="w-full border rounded px-3 py-2 dark:border-gray-600 dark:bg-neutral-700" required />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Tipo de ítem</label>
        <select v-model="tipoItem" class="w-full border rounded px-3 py-2 dark:border-gray-600 dark:bg-neutral-700" required>
          <option value="">Selecciona…</option>
          <option value="SERVICIO">Servicio</option>
          <option value="FISICO">Físico</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Categoría</label>
        <select v-model="categoriaId" class="w-full border rounded px-3 py-2 dark:border-gray-600 dark:bg-neutral-700" required>
          <option :value="null">Selecciona…</option>
          <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Imágenes (una o más)</label>
        <input ref="fileInput" type="file" accept="image/*" multiple required />
      </div>

      <div class="flex items-center gap-4">
        <button :disabled="loading" class="button-primary px-6 py-2 font-semibold">Crear</button>
        <NuxtLink to="/profile" class="button-secondary px-6 py-2 font-semibold inline-block">Cancelar</NuxtLink>
      </div>

      <div v-if="error" class="text-red-600">{{ error }}</div>
      <div v-if="success" class="text-green-600">Ítem creado correctamente.</div>
    </form>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

// UserInformacion no declara tipoUsuario (solo lo usan los flujos de registro/edición de perfil),
// pero checkAuth() sí lo popula en tiempo de ejecución desde /api/profile — cast explícito aquí.
const tipoUsuarioActual = computed(() => (authStore.user?.informacion as any)?.tipoUsuario?.tipo ?? null)

const nombre = ref('')
const tipoItem = ref('')
const categoriaId = ref<number | null>(null)
const categorias = ref<{ id: number; nombre: string }[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const error = ref('')
const success = ref(false)

onMounted(async () => {
  try {
    categorias.value = await $fetch('/api/categorias-catalogo')
  } catch (e) {
    console.error('Error cargando categorías:', e)
  }
})

async function handleSubmit() {
  error.value = ''
  success.value = false

  const fd = new FormData()
  fd.append('nombre', nombre.value)
  fd.append('tipoItem', tipoItem.value)
  fd.append('categoriaId', String(categoriaId.value ?? ''))

  const fileEl = fileInput.value
  if (fileEl?.files) {
    for (const file of Array.from(fileEl.files)) {
      fd.append('imagenFile', file)
    }
  }

  loading.value = true
  try {
    await $fetch('/api/catalogo', { method: 'POST', body: fd })
    success.value = true
    await router.push('/profile')
  } catch (e: any) {
    console.error(e)
    error.value = e?.data?.message || e?.message || 'Error al crear el ítem'
  } finally {
    loading.value = false
  }
}
</script>
