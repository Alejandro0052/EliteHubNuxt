<template>
  <div class="w-full min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
    <!-- Content Editor for Admins -->
    <ContentEditor 
      page="deportistas" 
      :initial-content="pageContent" 
      @updated="handleContentUpdate"
    />

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

        <!-- Features Grid -->
   <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 w-full">
      <div class="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-transform duration-300 transform hover:scale-105">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-4">Rendimiento Elite</h3>
        <p class="text-gray-600">Accede a entrenamientos especializados y técnicas avanzadas para maximizar tu potencial deportivo.</p>
      </div>

          <div class="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-transform duration-300 transform hover:scale-105">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Comunidad Deportiva</h3>
            <p class="text-gray-600">Conecta con otros atletas, comparte experiencias y forma parte de una comunidad comprometida.</p>
          </div>

          <div class="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-transform duration-300 transform hover:scale-105">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Seguimiento Personalizado</h3>
            <p class="text-gray-600">Monitorea tu progreso con herramientas avanzadas y recibe retroalimentación personalizada.</p>
          </div>
        </div>

        <!-- Sports Categories -->
        <div class="mb-16">
          <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Categorías Deportivas</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div v-for="sport in sports" :key="sport.name" class="text-center group cursor-pointer">
              <div class="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span class="text-2xl">{{ sport.icon }}</span>
              </div>
              <p class="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300">{{ sport.name }}</p>
            </div>
          </div>
        </div>

        <!-- CTA Section -->
        <div class="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 class="text-3xl md:text-4xl font-bold mb-6">¿Listo para ser un deportista elite?</h2>
          <p class="text-xl mb-8 opacity-90">Únete a nuestra plataforma y comienza tu transformación deportiva hoy mismo</p>
          <NuxtLink 
            to="/register" 
            class="inline-block bg-white text-blue-600 font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105"
          >
            Comenzar Ahora
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Deportistas Elite - EliteHub',
  description: 'Conecta con los mejores atletas y lleva tu rendimiento al siguiente nivel'
})

const { getContent } = useContent()

const pageContent = ref({
  title: '',
  subtitle: '',
  content: '',
  metadata: {}
})

const sports = ref([
  { name: 'Fútbol', icon: '⚽' },
  { name: 'Baloncesto', icon: '🏀' },
  { name: 'Tenis', icon: '🎾' },
  { name: 'Natación', icon: '🏊' },
  { name: 'Atletismo', icon: '🏃' },
  { name: 'Ciclismo', icon: '🚴' },
  { name: 'Voleibol', icon: '🏐' },
  { name: 'Gimnasia', icon: '🤸' },
  { name: 'Boxeo', icon: '🥊' },
  { name: 'Yoga', icon: '🧘' },
  { name: 'CrossFit', icon: '🏋️' },
  { name: 'Más deportes', icon: '🏆' }
])

const handleContentUpdate = (updatedContent) => {
  pageContent.value = updatedContent
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