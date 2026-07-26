<template>
  <div class="w-full min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
    <div class="max-w-3xl mx-auto py-12 px-4">
    <h1 class="text-2xl font-bold mb-6">Editar Evento</h1>

    <div v-if="loading">Cargando...</div>

    <div v-else-if="!canEdit" class="p-6 bg-yellow-50 rounded">No tienes permiso para editar este evento.</div>

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
        <label class="block text-sm font-medium mb-1">Fecha del evento</label>
        <input v-model="fechaEvento" type="date" class="w-full border rounded px-3 py-2" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Ubicación</label>
        <input v-model="ubicacion" class="w-full border rounded px-3 py-2" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Contenido</label>
        <textarea v-model="contenido" rows="6" class="w-full border rounded px-3 py-2"></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Imagen</label>
        <input ref="fileInput" type="file" accept="image/*" />
      </div>

      <div class="flex items-center gap-4">
        <button :disabled="saving" class="bg-green-400 hover:bg-green-500 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors">Guardar</button>
        <NuxtLink :to="`/eventos/${route.params.id}`" replace class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors inline-block">Cancelar</NuxtLink>
      </div>

      <div v-if="error" class="text-red-600">{{ error }}</div>
      <div v-if="success" class="text-green-600">Evento actualizado correctamente.</div>
    </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const evento = ref<any>(null)
const loading = ref(true)
const { canEdit } = useResourcePermissions('evento_noticia', evento)

const titulo = ref('')
const resumen = ref('')
const contenido = ref('')
const fechaEvento = ref('')
const ubicacion = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const saving = ref(false)
const error = ref('')
const success = ref(false)

onMounted(async () => {
  try {
    evento.value = await $fetch(`/api/eventos/${route.params.id}`)
    titulo.value = evento.value.titulo || ''
    resumen.value = evento.value.resumen || ''
    contenido.value = evento.value.contenido || ''
    ubicacion.value = evento.value.ubicacion || ''
    if (evento.value.fechaEvento) {
      fechaEvento.value = new Date(evento.value.fechaEvento).toISOString().slice(0, 10)
    }
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
  fd.append('titulo', titulo.value)
  fd.append('resumen', resumen.value || '')
  fd.append('contenido', contenido.value || '')
  fd.append('fechaEvento', fechaEvento.value || '')
  fd.append('ubicacion', ubicacion.value || '')

  const fileEl = fileInput.value
  if (fileEl?.files?.[0]) {
    fd.append('imageFile', fileEl.files[0])
  }

  saving.value = true
  try {
    await $fetch(`/api/eventos/${route.params.id}`, { method: 'PUT', body: fd })
    success.value = true
    await router.push(`/eventos/${route.params.id}`)
  } catch (e: any) {
    console.error(e)
    error.value = e?.message || 'Error al actualizar evento'
  } finally {
    saving.value = false
  }
}
</script>
