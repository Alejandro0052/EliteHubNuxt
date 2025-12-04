<template>
  <NuxtLink :to="`/eventos/${evento.id}`" class="group block">
    <div class="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 transform hover:scale-105">
      <div
        class="h-40 bg-center bg-cover"
        :style="evento.imagen ? { backgroundImage: `url(${evento.imagen})` } : { backgroundColor: '#f0f0f0' }"
      ></div>
      <div class="p-4">
        <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{{ evento.titulo }}</h3>
        <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ evento.resumen }}</p>
        <div class="flex items-center justify-between">
          <div class="text-xs text-gray-500">{{ formatDate(evento.fechaEvento || evento.createdAt) }}</div>
          <button class="text-black bg-white border border-black rounded-full px-3 py-1 text-xs hover:bg-gray-100 transition">Ver</button>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ evento: any }>()

function formatDate(d: string | Date | null | undefined) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString()
}
</script>
