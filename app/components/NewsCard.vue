<template>
  <NuxtLink :to="`/noticias/${news.id}`" class="group block">
    <div class="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 transform hover:scale-105 dark:bg-neutral-800">
      <div
        class="h-40 bg-center bg-cover"
        :style="news.imagen ? { backgroundImage: `url(${news.imagen})` } : { backgroundColor: '#f0f0f0' }"
      ></div>
      <div class="p-4">
        <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2 dark:text-white">{{ news.titulo }}</h3>
        <p class="text-sm text-gray-600 mb-3 line-clamp-2 dark:text-gray-300">{{ news.resumen }}</p>
        <div class="flex items-center justify-between">
          <div class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(news.publishedAt || news.createdAt) }}</div>
          <button class="text-black bg-white border border-black rounded-full px-3 py-1 text-xs hover:bg-gray-100 transition dark:text-white dark:bg-neutral-700 dark:border-gray-500 dark:hover:bg-neutral-600">Leer</button>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ news: any }>()

function formatDate(d: string | Date | null | undefined) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString()
}
</script>
