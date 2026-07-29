<template>
  <div class="w-full min-h-screen bg-surface-container dark:bg-surface-container-dark">
    <!-- Hero Section -->
    <section class="relative py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-page-shell mx-auto">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {{ pageContent.title || 'Deportistas Elite' }}
          </h1>
          <p class="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {{ pageContent.subtitle || 'Conecta con los mejores atletas y lleva tu rendimiento al siguiente nivel' }}
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-page-shell mx-auto">
        <!-- Custom Content -->
        <div v-if="pageContent.content" class="mb-16">
          <div v-html="pageContent.content"></div>
        </div>

        <!-- Filtro por deporte -->
        <div class="mb-6">
          <FilterChips v-model="selectedDeporteId" :options="deporteOptions" />
        </div>

        <!-- Directorio de Deportistas -->
        <InfiniteScrollList :key="selectedDeporteId ?? 'all'" :fetch-page="fetchPage">
          <template #default="{ item }">
            <UsuarioDirectoryCard :usuario="item" />
          </template>
          <template #empty>
            <p class="text-center text-gray-600 dark:text-gray-400">Todavía no hay deportistas registrados.</p>
          </template>
        </InfiniteScrollList>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Deportistas Elite - EliteHub',
  description: 'Conecta con los mejores atletas y lleva tu rendimiento al siguiente nivel',
  keepalive: true
})

const { getContent } = useContent()

const pageContent = ref({
  title: '',
  subtitle: '',
  content: '',
  metadata: {}
})

const deportes = ref([])
const selectedDeporteId = ref(null)
const deporteOptions = computed(() => [
  { value: null, label: 'Todos' },
  ...deportes.value.map((d) => ({ value: d.id, label: d.nombre })),
])

function fetchPage(cursor) {
  return $fetch('/api/usuarios', {
    query: { tipo: 'Deportista', cursor, deporteId: selectedDeporteId.value || undefined },
  })
}

// Load content on mount
onMounted(async () => {
  try {
    const content = await getContent('deportistas')
    pageContent.value = content
  } catch (error) {
    console.error('Error loading content:', error)
  }

  try {
    deportes.value = await $fetch('/api/deportes')
  } catch (error) {
    console.error('Error loading deportes:', error)
  }
})
</script>

<style scoped>
</style>