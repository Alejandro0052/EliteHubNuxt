<template>
  <div class="w-full min-h-screen bg-surface-container flex flex-col dark:bg-surface-container-dark">
    <!-- Hero Section -->
    <section class="relative py-20 px-4 sm:px-6 lg:px-8 flex-shrink-0">
      <div class="w-full max-w-page-shell mx-auto">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {{ pageContent.title || 'Patrocinadores Elite' }}
          </h1>
          <p class="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {{ pageContent.subtitle || 'Conecta tu marca con el talento deportivo y maximiza tu impacto en el mercado' }}
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="py-16 px-4 sm:px-6 lg:px-8 flex-grow">
      <div class="w-full max-w-page-shell mx-auto">
        <!-- Custom Content -->
        <div v-if="pageContent.content" class="mb-16">
          <div class="prose max-w-none" v-html="pageContent.content"></div>
        </div>

        <!-- Directorio de Patrocinadores -->
        <InfiniteScrollList :fetch-page="fetchPage">
          <template #default="{ item }">
            <UsuarioDirectoryCard :usuario="item" />
          </template>
          <template #empty>
            <p class="text-center text-gray-600 dark:text-gray-400">Todavía no hay patrocinadores registrados.</p>
          </template>
        </InfiniteScrollList>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Patrocinadores - EliteHub',
  description: 'Conecta tu marca con el talento deportivo y maximiza tu impacto en el mercado',
  keepalive: true
})

const { getContent } = useContent()

const pageContent = ref({
  title: '',
  subtitle: '',
  content: '',
  metadata: {}
})

function fetchPage(cursor) {
  return $fetch('/api/usuarios', { query: { tipo: 'Patrocinador', cursor } })
}

// Load content on mount
onMounted(async () => {
  try {
    const content = await getContent('patrocinadores')
    pageContent.value = content
  } catch (error) {
    console.error('Error loading content:', error)
  }
})
</script>

<style scoped>
</style>