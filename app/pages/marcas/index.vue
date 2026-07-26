<template>
  <div class="w-full min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
    <!-- Hero Section -->
    <section class="relative py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {{ pageContent.title || 'Marcas Deportivas' }}
          </h1>
          <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {{ pageContent.subtitle || 'Descubre las mejores marcas deportivas y encuentra el equipamiento perfecto para tu rendimiento' }}
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Custom Content -->
        <div v-if="pageContent.content" class="mb-16">
          <div class="max-w-none" v-html="pageContent.content"></div>
        </div>

        <!-- Directorio de Marcas -->
        <InfiniteScrollList :fetch-page="fetchPage">
          <template #default="{ item }">
            <UsuarioDirectoryCard :usuario="item" />
          </template>
          <template #empty>
            <p class="text-center text-gray-600">Todavía no hay marcas registradas.</p>
          </template>
        </InfiniteScrollList>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Marcas Deportivas - EliteHub',
  description: 'Descubre las mejores marcas deportivas y encuentra el equipamiento perfecto para tu rendimiento',
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
  return $fetch('/api/usuarios', { query: { tipo: 'Marca', cursor } })
}

// Load content on mount
onMounted(async () => {
  try {
    const content = await getContent('marcas')
    pageContent.value = content
  } catch (error) {
    console.error('Error loading content:', error)
  }
})
</script>

<style scoped>
</style>