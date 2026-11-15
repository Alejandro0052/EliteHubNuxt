<template>
  <div class="w-full min-h-screen bg-surface-container dark:bg-surface-container-dark">
    <div class="max-w-page-shell mx-auto px-4 pt-8 pb-16 sm:px-6 lg:px-8">
      <button type="button" class="button-secondary mb-8 flex items-center gap-2 px-4 py-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark" @click="goBack">
        <Icon name="fa6-solid:arrow-left" />
        <span>Volver</span>
      </button>

      <DirectoryHeader title="Noticias" subtitle="Novedades del deporte publicadas por la comunidad.">
        <template v-if="authStore.isAuthenticated" #action>
          <NuxtLink to="/admin/noticias/create" class="button-primary inline-flex items-center gap-2 px-5 py-2.5 font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
            <Icon name="fa6-solid:plus" />
            Crear noticia
          </NuxtLink>
        </template>
      </DirectoryHeader>

      <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        <template v-if="loading">
          <div
            v-for="n in 6"
            :key="n"
            class="aspect-[4/3] animate-pulse rounded-lg bg-surface-container-high motion-reduce:animate-none dark:bg-surface-container-high-dark"></div>
        </template>
        <template v-else>
          <NewsCard v-for="x in noticias" :key="x.id" :news="x" />
        </template>
      </div>
      <p v-if="!loading && noticias.length === 0" class="text-on-surface-variant dark:text-on-surface-variant-dark">
        Todavía no hay noticias publicadas.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import NewsCard from '~/components/NewsCard.vue'
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const noticias = ref<any[]>([])
const loading = ref(true)

const goBack = () => {
  // Always navigate to home to avoid returning to a previous 'create' page in history
  navigateTo('/')
}

onMounted(async () => {
  try {
    noticias.value = await $fetch('/api/noticias')
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
