<template>
  <div class="w-full min-h-screen bg-surface-container dark:bg-surface-container-dark">
    <div class="max-w-page-shell mx-auto px-4 pt-12 pb-16 sm:px-6 md:pt-16 lg:px-8">
      <DirectoryHeader
        :title="pageContent.title || 'Marcas'"
        :subtitle="pageContent.subtitle || 'Marcas de ropa y equipamiento deportivo. Mira su catálogo y escríbeles.'" />

      <div class="mt-6 mb-8">
        <NuxtLink
          to="/catalogo"
          class="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:focus-visible:outline-primary-dark">
          <Icon name="fa6-solid:store" />
          Ver catálogo completo
        </NuxtLink>
      </div>

      <!-- Contenido editable desde el admin -->
      <div
        v-if="pageContent.content"
        class="mb-10 max-w-[75ch] text-on-surface dark:text-on-surface-dark"
        v-html="pageContent.content"></div>

      <InfiniteScrollList
        :fetch-page="fetchPage"
        grid-class="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        skeleton-class="aspect-[4/6]">
        <template #default="{ item }">
          <UsuarioDirectoryCard :usuario="item" />
        </template>
        <template #empty>
          <p class="text-on-surface-variant dark:text-on-surface-variant-dark">Todavía no hay marcas registradas.</p>
        </template>
      </InfiniteScrollList>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Marcas - EliteHub',
  description: 'Marcas de ropa y equipamiento deportivo. Mira su catálogo y escríbeles.',
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