<template>
  <NuxtLink :to="`/noticias/${news.id}`" class="card-lift group block overflow-hidden rounded-lg border border-border-hairline bg-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:border-border-hairline-dark dark:bg-surface-container-dark dark:focus-visible:outline-primary-dark">
    <div class="relative aspect-[16/10] bg-black">
      <img v-if="news.imagen" :src="news.imagen" alt="" class="absolute inset-0 h-full w-full object-cover" />
    </div>
    <div class="border-t-4 border-transparent px-4 pt-3.5 pb-4 transition-colors duration-150 group-hover:border-primary group-focus-visible:border-primary motion-reduce:transition-none dark:group-hover:border-primary-dark dark:group-focus-visible:border-primary-dark">
      <p class="mb-1.5 text-sm text-on-surface-variant tabular-nums dark:text-on-surface-variant-dark">{{ formatDate(news.publishedAt || news.createdAt) }}</p>
      <h3 class="line-clamp-2 font-display text-[1.75rem] leading-[0.95] font-extrabold text-on-surface uppercase dark:text-on-surface-dark">{{ news.titulo }}</h3>
      <p v-if="news.resumen" class="mt-2 line-clamp-2 text-sm text-on-surface-variant dark:text-on-surface-variant-dark">{{ news.resumen }}</p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ news: any }>()

function formatDate(d: string | Date | null | undefined) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>
