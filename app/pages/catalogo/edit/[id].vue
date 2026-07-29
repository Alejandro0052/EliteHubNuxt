<template>
  <div class="w-full min-h-screen bg-surface-container dark:bg-surface-container-dark">
    <div class="max-w-page-shell mx-auto py-12 px-4">
    <div class="max-w-3xl mx-auto dark:text-white">
    <h1 class="text-2xl font-bold mb-6">Editar ítem de catálogo</h1>

    <div v-if="loading">Cargando...</div>

    <div v-else-if="!canEdit" class="p-6 bg-yellow-50 rounded dark:text-gray-900">No tienes permiso para editar este ítem.</div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Nombre</label>
        <input v-model="nombre" class="w-full border rounded px-3 py-2 dark:border-gray-600 dark:bg-neutral-700" required />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Tipo de ítem</label>
        <select v-model="tipoItem" class="w-full border rounded px-3 py-2 dark:border-gray-600 dark:bg-neutral-700" required>
          <option value="SERVICIO">Servicio</option>
          <option value="FISICO">Físico</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Categoría</label>
        <select v-model="categoriaId" class="w-full border rounded px-3 py-2 dark:border-gray-600 dark:bg-neutral-700" required>
          <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Imágenes nuevas (opcional)</label>
        <input ref="fileInput" type="file" accept="image/*" multiple />
        <p class="text-xs text-gray-500 mt-1 dark:text-gray-400">Deja vacío para conservar las imágenes actuales.</p>
      </div>

      <div class="flex items-center gap-4">
        <button :disabled="saving" class="button-primary px-6 py-2 font-semibold">Guardar</button>
        <NuxtLink :to="`/catalogo/${route.params.id}`" replace class="button-secondary px-6 py-2 font-semibold inline-block">Cancelar</NuxtLink>
      </div>

      <div v-if="error" class="text-red-600">{{ error }}</div>
      <div v-if="success" class="text-green-600">Ítem actualizado correctamente.</div>
    </form>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const item = ref<any>(null)
const loading = ref(true)
const { canEdit } = useResourcePermissions('catalogo_item', computed(() => (item.value ? { autorId: item.value.usuarioId } : null)))

const categorias = ref<{ id: number; nombre: string }[]>([])
const nombre = ref('')
const tipoItem = ref('')
const categoriaId = ref<number | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const saving = ref(false)
const error = ref('')
const success = ref(false)

onMounted(async () => {
  try {
    item.value = await $fetch('/api/catalogo/' + route.params.id)
    nombre.value = item.value.nombre || ''
    tipoItem.value = item.value.tipoItem || ''
    categoriaId.value = item.value.categoriaId ?? null
    categorias.value = await $fetch('/api/categorias-catalogo')
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
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

  saving.value = true
  try {
    await $fetch('/api/catalogo/' + route.params.id, { method: 'PUT', body: fd })
    success.value = true
    // replace, no push: evita apilar la vista de edición en el historial, para que
    // "Volver" desde el detalle no regrese aquí sino a la vista donde estaba antes de editar.
    await router.replace(`/catalogo/${route.params.id}`)
  } catch (e: any) {
    console.error(e)
    error.value = e?.data?.message || 'Error al actualizar el ítem'
  } finally {
    saving.value = false
  }
}
</script>
