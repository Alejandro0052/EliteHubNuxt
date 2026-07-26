<template>
  <div class="w-full min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
    <div class="max-w-7xl mx-auto py-12 px-4">
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <button @click="goBack" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Icon name="fa6-solid:arrow-left" />
          <span>Volver</span>
        </button>
        <h1 class="text-3xl font-bold">Eventos</h1>
      </div>
      <div v-if="authStore.isAuthenticated">
        <NuxtLink to="/admin/eventos/create" class="block">
          <div class="bg-green-400 hover:bg-green-500 rounded-lg shadow-md overflow-hidden transition-all duration-300 transform hover:scale-105 flex items-center justify-center px-6 py-3 gap-2">
            <div class="text-xl font-bold text-white">+</div>
            <div class="text-white font-semibold">Crear</div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <div v-if="loading">Cargando...</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <EventCard v-for="e in eventos" :key="e.id" :evento="e" />
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import EventCard from '~/components/EventCard.vue'
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const eventos = ref<any[]>([])
const loading = ref(true)

const goBack = () => {
  // Always navigate to home to avoid returning to a previous 'create' page in history
  navigateTo('/')
}

onMounted(async () => {
  try {
    eventos.value = await $fetch('/api/eventos')
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
