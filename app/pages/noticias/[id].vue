<template>
  <div class="w-full min-h-screen bg-surface-container dark:bg-surface-container-dark">
    <div class="max-w-4xl mx-auto py-12 px-4">
    <button @click="goBack" class="button-secondary px-4 py-2 mb-6 flex items-center gap-2">
      <Icon name="fa6-solid:arrow-left" />
      <span>Volver</span>
    </button>
    <div v-if="loading">Cargando...</div>
    <div v-else>
      <div class="mb-4 flex items-center gap-3">
        <NuxtLink
          v-if="canEdit"
          :to="`/admin/noticias/edit/${noticia.id}`"
          class="button-primary px-4 py-2">
          Editar
        </NuxtLink>
        <button
          v-if="canDelete"
          @click="handleDelete"
          class="button-destructive px-4 py-2">
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
