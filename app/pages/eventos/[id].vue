<template>
  <div class="w-full min-h-screen bg-surface-container dark:bg-surface-container-dark">
    <div class="max-w-4xl mx-auto py-12 px-4">
    <button type="button" @click="goBack" class="button-secondary px-4 py-2 mb-6 flex items-center gap-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
      <Icon name="fa6-solid:arrow-left" />
      <span>Volver</span>
    </button>
    <div v-if="loading" class="text-on-surface-variant dark:text-on-surface-variant-dark">Cargando...</div>
    <div v-else>
      <div class="mb-4 flex items-center gap-3">
        <NuxtLink
          v-if="canEdit"
          :to="`/admin/eventos/edit/${evento.id}`"
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
      <h1 class="font-display text-5xl leading-[0.92] font-extrabold text-on-surface uppercase sm:text-6xl md:text-7xl dark:text-on-surface-dark">{{ evento.titulo }}</h1>
      <p class="mt-4 mb-6 flex flex-wrap gap-x-6 gap-y-1 border-b-2 border-on-surface pb-4 dark:border-on-surface-dark font-semibold text-on-surface dark:text-on-surface-dark">
        <span class="flex items-center gap-2 tabular-nums"><Icon name="fa6-solid:calendar-day" class="text-primary dark:text-primary-dark" />{{ formatDate(evento.fechaEvento || evento.createdAt) }}</span>
        <span v-if="evento.ubicacion" class="flex items-center gap-2"><Icon name="fa6-solid:location-dot" class="text-primary dark:text-primary-dark" />{{ evento.ubicacion }}</span>
      </p>
      <img v-if="evento.imagen" :src="evento.imagen" alt="" class="w-full rounded-lg mb-6" />
      <div v-html="evento.contenido" class="max-w-[75ch] text-lg text-on-surface dark:text-on-surface-dark"></div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const evento = ref<any>(null)
const loading = ref(true)
const route = useRoute()
const { canEdit, canDelete } = useResourcePermissions('evento_noticia', evento)
const { askConfirm } = useConfirm()

function formatDate(d: string | Date | null | undefined) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  try {
    evento.value = await $fetch(`/api/eventos/${route.params.id}`)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

async function handleDelete() {
  if (!(await askConfirm({ message: '¿Eliminar este evento? Esta acción no se puede deshacer.' }))) return
  try {
    await $fetch(`/api/eventos/${route.params.id}`, { method: 'DELETE' })
    await router.push('/eventos')
  } catch (err) {
    console.error(err)
  }
}
</script>
