<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
    <!-- Content Editor for Admins -->
    <ContentEditor 
      page="marcas" 
      :initial-content="pageContent" 
      @updated="handleContentUpdate"
    />

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

        <!-- Featured Brands -->
        <div class="mb-16">
          <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Marcas Destacadas</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            <div v-for="brand in featuredBrands" :key="brand.name" class="group cursor-pointer">
              <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div class="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span class="text-2xl font-bold text-gray-600">{{ brand.logo }}</span>
                </div>
                <p class="text-center text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors duration-300">{{ brand.name }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Categories -->
        <div class="mb-16">
          <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Categorías de Productos</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div class="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-3">Ropa Deportiva</h3>
                <p class="text-gray-600 mb-4">Encuentra la mejor indumentaria deportiva para cada disciplina y ocasión.</p>
                <button class="text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-300">Ver Productos →</button>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div class="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-3">Calzado Deportivo</h3>
                <p class="text-gray-600 mb-4">Calzado especializado para cada deporte con la mejor tecnología y comodidad.</p>
                <button class="text-green-600 font-semibold hover:text-green-800 transition-colors duration-300">Ver Productos →</button>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div class="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                </svg>
              </div>
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-3">Equipamiento</h3>
                <p class="text-gray-600 mb-4">Accesorios y equipamiento profesional para maximizar tu rendimiento.</p>
                <button class="text-purple-600 font-semibold hover:text-purple-800 transition-colors duration-300">Ver Productos →</button>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div class="h-48 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </div>
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-3">Suplementos</h3>
                <p class="text-gray-600 mb-4">Nutrición deportiva y suplementos para optimizar tu rendimiento.</p>
                <button class="text-red-600 font-semibold hover:text-red-800 transition-colors duration-300">Ver Productos →</button>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div class="h-48 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-3">Tecnología</h3>
                <p class="text-gray-600 mb-4">Dispositivos y apps para monitorear y mejorar tu rendimiento deportivo.</p>
                <button class="text-orange-600 font-semibold hover:text-orange-800 transition-colors duration-300">Ver Productos →</button>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div class="h-48 bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-3">Accesorios</h3>
                <p class="text-gray-600 mb-4">Complementos esenciales para completar tu equipamiento deportivo.</p>
                <button class="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors duration-300">Ver Productos →</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Benefits Section -->
        <div class="mb-16">
          <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">¿Por qué elegir nuestras marcas?</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="text-center">
              <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Calidad Garantizada</h3>
              <p class="text-gray-600 text-sm">Productos de las mejores marcas con garantía de calidad y durabilidad.</p>
            </div>

            <div class="text-center">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Envío Rápido</h3>
              <p class="text-gray-600 text-sm">Entrega express en 24-48 horas para que no pares tu entrenamiento.</p>
            </div>

            <div class="text-center">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Mejores Precios</h3>
              <p class="text-gray-600 text-sm">Precios competitivos y ofertas exclusivas para la comunidad EliteHub.</p>
            </div>

            <div class="text-center">
              <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Soporte Experto</h3>
              <p class="text-gray-600 text-sm">Asesoramiento personalizado de expertos en deportes y equipamiento.</p>
            </div>
          </div>
        </div>

        <!-- CTA Section -->
        <div class="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 class="text-3xl md:text-4xl font-bold mb-6">¿Buscas equipamiento de calidad?</h2>
          <p class="text-xl mb-8 opacity-90">Explora nuestro catálogo completo y encuentra todo lo que necesitas para alcanzar tus metas deportivas</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="bg-white text-orange-600 font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105">
              Ver Catálogo Completo
            </button>
            <NuxtLink 
              to="/register" 
              class="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-full hover:bg-white hover:text-orange-600 transition-colors duration-300"
            >
              Únete Ahora
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Marcas Deportivas - EliteHub',
  description: 'Descubre las mejores marcas deportivas y encuentra el equipamiento perfecto para tu rendimiento'
})

const { getContent } = useContent()

const pageContent = ref({
  title: '',
  subtitle: '',
  content: '',
  metadata: {}
})

const featuredBrands = ref([
  { name: 'Nike', logo: 'N' },
  { name: 'Adidas', logo: 'A' },
  { name: 'Puma', logo: 'P' },
  { name: 'Under Armour', logo: 'UA' },
  { name: 'Reebok', logo: 'R' },
  { name: 'New Balance', logo: 'NB' },
  { name: 'Asics', logo: 'AS' },
  { name: 'Mizuno', logo: 'M' },
  { name: 'Wilson', logo: 'W' },
  { name: 'Head', logo: 'H' },
  { name: 'Speedo', logo: 'S' },
  { name: 'Oakley', logo: 'O' }
])

const handleContentUpdate = (updatedContent) => {
  pageContent.value = updatedContent
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