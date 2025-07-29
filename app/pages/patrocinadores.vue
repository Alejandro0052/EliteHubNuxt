<template>
  <div class="w-full min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col">
    <!-- Content Editor for Admins -->
    <ContentEditor 
      page="patrocinadores" 
      :initial-content="pageContent" 
      @updated="handleContentUpdate"
    />

    <!-- Hero Section -->
    <section class="relative py-20 px-4 sm:px-6 lg:px-8 flex-shrink-0">
      <div class="w-full max-w-7xl mx-auto">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {{ pageContent.title || 'Patrocinadores Elite' }}
          </h1>
          <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {{ pageContent.subtitle || 'Conecta tu marca con el talento deportivo y maximiza tu impacto en el mercado' }}
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="py-16 px-4 sm:px-6 lg:px-8 flex-grow">
      <div class="w-full max-w-7xl mx-auto">
        <!-- Custom Content -->
        <div v-if="pageContent.content" class="mb-16">
          <div class="prose max-w-none" v-html="pageContent.content"></div>
        </div>

        <!-- Benefits Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div class="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-transform duration-300 transform hover:scale-105">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Alcance Masivo</h3>
            <p class="text-gray-600">Llega a miles de deportistas y aficionados comprometidos con el alto rendimiento y estilo de vida saludable.</p>
          </div>

          <div class="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-transform duration-300 transform hover:scale-105">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Audiencia Premium</h3>
            <p class="text-gray-600">Accede a una audiencia de alto valor adquisitivo interesada en productos y servicios de calidad.</p>
          </div>

          <div class="bg-white rounded-xl shadow-lg p-8 hhover:shadow-xl transition-transform duration-300 transform hover:scale-105">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">ROI Medible</h3>
            <p class="text-gray-600">Obtén métricas detalladas y análisis de rendimiento para optimizar tu inversión publicitaria.</p>
          </div>
        </div>

        <!-- Sponsorship Packages -->
        <div class="mb-16">
          <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Paquetes de Patrocinio</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Bronze Package -->
            <div class="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200 hover:border-orange-400 hover:shadow-xl transition-transform duration-300 transform hover:scale-105">
              <div class="text-center mb-6">
                <h3 class="text-2xl font-bold text-gray-900 mb-2">Bronce</h3>
                <div class="text-4xl font-bold text-orange-600 mb-4">$299</div>
                <p class="text-gray-600">Perfecto para empezar</p>
              </div>
              <ul class="space-y-3 mb-8">
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Logo en página principal
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Mención en redes sociales
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Reporte mensual básico
                </li>
              </ul>
              <button class="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors duration-300">
                Seleccionar Plan
              </button>
            </div>

            <!-- Silver Package -->
            <div class="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-400 hover:shadow-xl transition-transform duration-300 transform hover:scale-105">
              <div class="text-center mb-6">
                <div class="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium mb-4">Más Popular</div>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">Plata</h3>
                <div class="text-4xl font-bold text-blue-600 mb-4">$599</div>
                <p class="text-gray-600">Ideal para crecimiento</p>
              </div>
              <ul class="space-y-3 mb-8">
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Todo lo del plan Bronce
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Banner destacado
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Newsletter semanal
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Análisis detallado
                </li>
              </ul>
              <button class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                Seleccionar Plan
              </button>
            </div>

            <!-- Gold Package -->                                                                       
            <div class="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200 hover:border-yellow-400 transition-transform duration-300 transform hover:scale-105">
              <div class="text-center mb-6">
                <h3 class="text-2xl font-bold text-gray-900 mb-2">Oro</h3>
                <div class="text-4xl font-bold text-yellow-600 mb-4">$999</div>
                <p class="text-gray-600">Máxima exposición</p>
              </div>
              <ul class="space-y-3 mb-8">
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Todo lo del plan Plata
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Patrocinio de eventos
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Contenido personalizado
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Soporte dedicado
                </li>
              </ul>
              <button class="w-full bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors duration-300">
                Seleccionar Plan
              </button>
            </div>
          </div>
        </div>

        <!-- CTA Section -->
        <div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 class="text-3xl md:text-4xl font-bold mb-6">¿Listo para impulsar tu marca?</h2>
          <p class="text-xl mb-8 opacity-90">Únete a las marcas líderes que confían en EliteHub para conectar con su audiencia objetivo</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink 
              to="/contactUs" 
              class="inline-block bg-white text-purple-600 font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105"
            >
              Contactar Ahora
            </NuxtLink>
            <button class="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-full hover:bg-white hover:text-purple-600 transition-colors duration-300">
              Ver Casos de Éxito
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Patrocinadores - EliteHub',
  description: 'Conecta tu marca con el talento deportivo y maximiza tu impacto en el mercado'
})

const { getContent } = useContent()

const pageContent = ref({
  title: '',
  subtitle: '',
  content: '',
  metadata: {}
})

const handleContentUpdate = (updatedContent) => {
  pageContent.value = updatedContent
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