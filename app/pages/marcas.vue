<template>
 
   <div class="min-h-screen w-full bg-white flex">
    <!-- Columna izquierda (espacio blanco) -->
    <div class="hidden xl:block xl:w-1/6 bg-white"></div>

    <!-- Columna central (TODO tu contenido va aquí) -->
  <div class="w-full max-w-6xl bg-white mx-auto">


    <!-- Header Banner -->
    <div class="bg-red-600 text-white py-4">
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">Menú</h1>
          <div class="text-sm">Entrega • Recogida • Restaurante</div>
        </div>
      </div>
    </div>

    <!-- Main Menu -->
      <div class="max-w-5xl mx-auto px-6 py-10">

        <!-- Chicken Category -->
        <section class="mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-red-600 pb-2">Pollo</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            <!-- Product 1 -->
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-sm">
              <div class="h-48 bg-gray-100 flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=300&fit=crop&crop=center" alt="Bucket de Pollo" class="w-full h-full object-cover">
              </div>
              <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Bucket de Pollo Familiar</h3>
                <p class="text-sm text-gray-600 mb-3">12 piezas de pollo crujiente con papas y ensalada</p>
                <div class="flex items-center justify-between">
                  <span class="text-xl font-bold text-red-600">$24.99</span>
                  <button class="bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 hover:scale-105 transition-all duration-300 transform">
                    Agregar
                  </button>
                </div>
              </div>
            </div>

            <!-- Product 2 -->
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-sm">
              <div class="h-48 bg-gray-100 flex items-center justify-center">
                 <img src="https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop&crop=center" alt="Sándwich de Pollo" class="w-full h-full object-cover">
              </div>
              <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Hamburguesa de Pollo</h3>
                <p class="text-sm text-gray-600 mb-3">Hamburguesa de Pollo</p>
                <div class="flex items-center justify-between">
                  <span class="text-xl font-bold text-red-600">$12.99</span>
                  <button class="bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 hover:scale-105 transition-all duration-300 transform">
                    Agregar
                  </button>
                </div>
              </div>
            </div>

            <!-- Product 3 -->
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-sm">
              <div class="h-48 bg-gray-100 flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop&crop=center" alt="Sándwich de Pollo" class="w-full h-full object-cover">
              </div>
              <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Sándwich de Pollo</h3>
                <p class="text-sm text-gray-600 mb-3">Pollo crujiente con lechuga y mayonesa</p>
                <div class="flex items-center justify-between">
                  <span class="text-xl font-bold text-red-600">$8.99</span>
                  <button class="bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 hover:scale-105 transition-all duration-300 transform">
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

      <!-- Burgers Category -->
      <section class="mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-red-600 pb-2">Hamburguesas</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          <!-- Product 4 -->
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-sm">
            <div class="h-48 bg-gray-100 flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&crop=center" alt="Hamburguesa Clásica" class="w-full h-full object-cover">
            </div>
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Hamburguesa Clásica</h3>
              <p class="text-sm text-gray-600 mb-3">Carne 100% de res con queso, lechuga y tomate</p>
              <div class="flex items-center justify-between">
                <span class="text-xl font-bold text-red-600">$9.99</span>
                <button class="bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 hover:scale-105 transition-all duration-300 transform">
                  Agregar
                </button>
              </div>
            </div>
          </div>

          <!-- Product 5 -->
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-sm">
            <div class="h-48 bg-gray-100 flex items-center justify-center">
            <img src="https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop&crop=center" alt="Sándwich de Pollo" class="w-full h-full object-cover">
            </div>
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Hamburguesa de Pollo Clasica</h3>
              <p class="text-sm text-gray-600 mb-3">Pechuga de pollo crujiente</p>
              <div class="flex items-center justify-between">
                <span class="text-xl font-bold text-red-600">$8.99</span>
                <button class="bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 hover:scale-105 transition-all duration-300 transform">
                  Agregar
                </button>
              </div>
            </div>
          </div>

          <!-- Product 6 -->
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-sm">
            <div class="h-48 bg-gray-100 flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=400&h=300&fit=crop&crop=center" alt="Hamburguesa Vegetariana" class="w-full h-full object-cover">
            </div>
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Hamburguesa Vegetariana</h3>
              <p class="text-sm text-gray-600 mb-3">Hamburguesa de garbanzos con verduras frescas</p>
              <div class="flex items-center justify-between">
                <span class="text-xl font-bold text-red-600">$7.99</span>
                <button class="bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 hover:scale-105 transition-all duration-300 transform">
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Sides Category -->
      <section class="mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-red-600 pb-2">Acompañamientos</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          <!-- Product 7 -->
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-sm">
            <div class="h-48 bg-gray-100 flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop&crop=center" alt="Papas Fritas" class="w-full h-full object-cover">
            </div>
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Papas Fritas Grandes</h3>
              <p class="text-sm text-gray-600 mb-3">Porción grande de papas fritas doradas</p>
              <div class="flex items-center justify-between">
                <span class="text-xl font-bold text-red-600">$4.99</span>
                <button class="bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 hover:scale-105 transition-all duration-300 transform">
                  Agregar
                </button>
              </div>
            </div>
          </div>

          <!-- Product 8 -->
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-sm">
            <div class="h-48 bg-gray-100 flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&h=300&fit=crop&crop=center" alt="Aros de Cebolla" class="w-full h-full object-cover">
            </div>
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Aros de Cebolla</h3>
              <p class="text-sm text-gray-600 mb-3">Aros de cebolla crujientes con salsa</p>
              <div class="flex items-center justify-between">
                <span class="text-xl font-bold text-red-600">$5.99</span>
                <button class="bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 hover:scale-105 transition-all duration-300 transform">
                  Agregar
                </button>
              </div>
            </div>
          </div>

          <!-- Product 9 -->
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-sm">
            <div class="h-48 bg-gray-100 flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop&crop=center" alt="Papas Fritas" class="w-full h-full object-cover">
            </div>
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Papas Fritas Pequeñas</h3>
              <p class="text-sm text-gray-600 mb-3">Papas Fritas Pequeñas</p>
              <div class="flex items-center justify-between">
                <span class="text-xl font-bold text-red-600">$3.99</span>
                <button class="bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 hover:scale-105 transition-all duration-300 transform">
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Drinks Category -->
      <section class="mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-red-600 pb-2">Bebidas</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          <!-- Product 10 -->
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-sm">
            <div class="h-48 bg-gray-100 flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop&crop=center" alt="Coca Cola" class="w-full h-full object-cover">
            </div>
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Coca Cola Grande</h3>
              <p class="text-sm text-gray-600 mb-3">Refresco de cola helado</p>
              <div class="flex items-center justify-between">
                <span class="text-xl font-bold text-red-600">$2.99</span>
                <button class="bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 hover:scale-105 transition-all duration-300 transform">
                  Agregar
                </button>
              </div>
            </div>
          </div>

          <!-- Product 11 -->
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-sm">
            <div class="h-48 bg-gray-100 flex items-center justify-center">
             <img src="https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop&crop=center" alt="Limonada" class="w-full h-full object-cover">
            </div>
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Limonada Alternativa</h3>
              <p class="text-sm text-gray-600 mb-3">Refresco de limonada alternativa</p>
              <div class="flex items-center justify-between">
                <span class="text-xl font-bold text-red-600">$2.99</span>
                <button class="bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 hover:scale-105 transition-all duration-300 transform">
                  Agregar
                </button>
              </div>
            </div>
          </div>

          <!-- Product 12 -->
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-sm">
            <div class="h-48 bg-gray-100 flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop&crop=center" alt="Limonada" class="w-full h-full object-cover">
            </div>
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Limonada Fresca</h3>
              <p class="text-sm text-gray-600 mb-3">Limonada natural preparada fresca</p>
              <div class="flex items-center justify-between">
                <span class="text-xl font-bold text-red-600">$3.49</span>
                <button class="bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 hover:scale-105 transition-all duration-300 transform">
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
    </div>

    <!-- Columna derecha (espacio blanco) -->
    <div class="hidden xl:block xl:w-1/6 bg-white"></div>
 


</template>

<script setup>
definePageMeta({
  title: 'Menú',
  description: 'Descubre nuestro delicioso menú de pollo frito y más'
})

</script>
<style scoped>
</style>
