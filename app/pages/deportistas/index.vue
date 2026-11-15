<template>
  <div class="w-full min-h-screen bg-surface-container dark:bg-surface-container-dark">
    <div class="max-w-page-shell mx-auto px-4 pt-12 pb-16 sm:px-6 md:pt-16 lg:px-8">
      <!-- Encabezado -->
      <DirectoryHeader
        :title="pageContent.title || 'Deportistas'"
        :subtitle="pageContent.subtitle || 'Atletas de fútbol, ciclismo, patinaje y boxeo que buscan marcas, nutricionistas y patrocinadores.'" />

      <!-- Filtro por deporte -->
      <nav aria-label="Filtrar por deporte" class="mt-4 mb-8">
        <FilterChips v-model="selectedDeporteId" :options="deporteOptions" variant="tabs" />
      </nav>

      <!-- Contenido editable desde el admin -->
      <div
        v-if="pageContent.content"
        class="mb-10 max-w-[75ch] text-on-surface dark:text-on-surface-dark"
        v-html="pageContent.content"></div>

      <!-- Directorio de deportistas -->
      <InfiniteScrollList
        :key="selectedDeporteId ?? 'all'"
        :fetch-page="fetchPage"
        grid-class="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        skeleton-class="aspect-[4/6]">
        <template #default="{ item }">
          <UsuarioDirectoryCard :usuario="item" />
        </template>
        <template #empty>
          <p class="text-on-surface-variant dark:text-on-surface-variant-dark">
            {{ selectedDeporteId ? 'Todavía no hay deportistas registrados en este deporte. Prueba con otro o mira todos.' : 'Todavía no hay deportistas registrados.' }}
          </p>
        </template>
      </InfiniteScrollList>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Deportistas - EliteHub',
  description: 'Atletas de fútbol, ciclismo, patinaje y boxeo que buscan marcas, nutricionistas y patrocinadores.',
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