<template>
  <div class="w-full min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
    <div class="max-w-4xl mx-auto py-12 px-4">
    <button @click="goBack" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mb-6 flex items-center gap-2 transition-colors">
      <Icon name="fa6-solid:arrow-left" />
      <span>Volver</span>
    </button>
    <div v-if="loading">Cargando...</div>
    <div v-else>
      <div class="mb-4 flex items-center gap-3">
        <NuxtLink
          v-if="canEdit"
          :to="`/admin/noticias/edit/${noticia.id}`"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
          Editar
        </NuxtLink>
        <button
          v-if="canDelete"
          @click="handleDelete"
          class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
          Eliminar
        </button>
      </div>
      <h1 class="text-4xl font-bold mb-4">{{ noticia.titulo }}</h1>
      <div class="text-sm text-gray-500 mb-6">{{ formatDate(noticia.publishedAt || noticia.createdAt) }}</div>
      <img v-if="noticia.imagen" :src="noticia.imagen" class="w-full rounded-lg mb-6" />
      <div v-html="noticia.contenido" class="prose max-w-none"></div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const noticia = ref<any>(null)
const loading = ref(true)
const route = useRoute()
const { canEdit, canDelete } = useResourcePermissions('evento_noticia', noticia)
const { askConfirm } = useConfirm()

function formatDate(d: string | Date | null | undefined) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString()
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  try {
    noticia.value = await $fetch(`/api/noticias/${route.params.id}`)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

async function handleDelete() {
  if (!(await askConfirm({ message: '¿Eliminar esta noticia? Esta acción no se puede deshacer.' }))) return
  try {
    await $fetch(`/api/noticias/${route.params.id}`, { method: 'DELETE' })
    await router.push('/noticias')
  } catch (err) {
    console.error(err)
  }
}
</script>
