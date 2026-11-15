<template>
  <NuxtLink :to="`/eventos/${evento.id}`" class="card-lift group block overflow-hidden rounded-lg border border-border-hairline bg-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:border-border-hairline-dark dark:bg-surface-container-dark dark:focus-visible:outline-primary-dark">
    <div class="relative aspect-[16/10] bg-black">
      <img v-if="evento.imagen" :src="evento.imagen" alt="" class="absolute inset-0 h-full w-full object-cover" />
      <!-- La fecha es el dato clave de un evento: va grande, sobre la imagen -->
      <div v-if="fecha" class="absolute bottom-0 left-4 bg-white px-3 pt-2 pb-1.5 text-center text-black">
        <div class="font-display text-4xl leading-[0.85] font-extrabold tabular-nums">{{ fecha.dia }}</div>
        <div class="text-[0.8125rem] font-semibold">{{ fecha.mes }}</div>
      </div>
    </div>
    <div class="border-t-4 border-transparent px-4 pt-3.5 pb-4 transition-colors duration-150 group-hover:border-primary group-focus-visible:border-primary motion-reduce:transition-none dark:group-hover:border-primary-dark dark:group-focus-visible:border-primary-dark">
      <h3 class="line-clamp-2 font-display text-[1.75rem] leading-[0.95] font-extrabold text-on-surface uppercase dark:text-on-surface-dark">{{ evento.titulo }}</h3>
      <p v-if="evento.ubicacion" class="mt-1.5 truncate font-semibold text-primary dark:text-primary-dark">{{ evento.ubicacion }}</p>
      <p v-if="evento.resumen" class="mt-2 line-clamp-2 text-sm text-on-surface-variant dark:text-on-surface-variant-dark">{{ evento.resumen }}</p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{ evento: any }>()

const fecha = computed(() => {
  const d = props.evento.fechaEvento || props.evento.createdAt
  if (!d) return null
  const date = new Date(d)
  return {
    dia: date.toLocaleDateString('es', { day: 'numeric' }),
    mes: date.toLocaleDateString('es', { month: 'short', year: 'numeric' }).replace('.', ''),
  }
})
</script>
