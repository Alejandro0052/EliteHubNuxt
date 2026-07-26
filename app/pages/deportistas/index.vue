<template>
  <div class="w-full min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
    <!-- Hero Section -->
    <section class="relative py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {{ pageContent.title || 'Deportistas Elite' }}
          </h1>
          <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {{ pageContent.subtitle || 'Conecta con los mejores atletas y lleva tu rendimiento al siguiente nivel' }}
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Custom Content -->
        <div v-if="pageContent.content" class="mb-16">
          <div v-html="pageContent.content"></div>
        </div>

        <!-- Directorio de Deportistas -->
        <InfiniteScrollList :fetch-page="fetchPage">
          <template #default="{ item }">
            <UsuarioDirectoryCard :usuario="item" />
          </template>
          <template #empty>
            <p class="text-center text-gray-600">Todavía no hay deportistas registrados.</p>
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

function fetchPage(cursor) {
  return $fetch('/api/usuarios', { query: { tipo: 'Deportista', cursor } })
}

// Load content on mount
onMounted(async () => {
  try {
    const content = await getContent('deportistas')
    pageContent.value = content
  } catch (error) {
    console.error('Error loading content:', error)
  }
})
</script>

<style scoped>
</style>