<template>
  <div class="w-full min-h-screen bg-surface-container dark:bg-surface-container-dark">
    <div class="max-w-page-shell mx-auto px-4 pt-12 pb-16 sm:px-6 md:pt-16 lg:px-8">
      <DirectoryHeader
        :title="pageContent.title || 'Patrocinadores'"
        :subtitle="pageContent.subtitle || 'Empresas y personas que apoyan a deportistas con patrocinio.'" />

      <div class="mb-8"></div>

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
          <p class="text-on-surface-variant dark:text-on-surface-variant-dark">Todavía no hay patrocinadores registrados.</p>
        </template>
      </InfiniteScrollList>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Patrocinadores - EliteHub',
  description: 'Empresas y personas que apoyan a deportistas con patrocinio.',
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