<template>
	<div class="mx-auto max-w-[120rem] space-y-6 bg-neutral-100 py-10 text-black dark:bg-neutral-900 dark:text-white">
		<!-- HERO -->
		<div class="flex flex-col gap-6 lg:h-[500px] lg:flex-row xl:h-[700px]">
			<div
				class="relative flex h-full min-h-[250px] w-full flex-1 overflow-hidden rounded-2xl lg:min-h-[350px] lg:w-2/3 xl:min-h-[400px]">
				<video
					class="h-full min-h-[250px] w-full object-cover md:min-h-[350px] xl:min-h-[400px]"
					autoplay
					loop
					muted
					src="/videoplayback.webm"></video>
				<div class="absolute inset-0 bg-black/40"></div>
				<div class="absolute inset-8 flex items-end">
					<div class="space-y-2 text-white md:space-y-6">
						<h1 class="text-xl sm:text-4xl xl:text-7xl">
							Más que una red, una comunidad deportiva.
						</h1>
						<h2 class="text-sm sm:text-xl xl:text-2xl">Conecta. Entrena. Crece.</h2>
					</div>
				</div>
			</div>
			<div
				class="flex h-full w-full flex-col space-y-4 rounded-2xl bg-white px-8 py-10 lg:min-h-[350px] lg:w-1/3 xl:min-h-[400px] dark:bg-neutral-800 dark:text-white">
				<div class="space-y-2">
					<h1 class="text-3xl font-semibold">Bienvenido a Elite Hub</h1>
					<p class="text-pretty text-gray-600 dark:text-gray-300">
						La red social donde deportistas, nutricionistas, patrocinadores y marcas pueden
						conectarse y crear nuevas oportunidades.
					</p>
				</div>
				<div class="flex flex-col gap-4 overflow-y-auto xl:max-h-[500px]">
					<NuxtLink to="/deportistas">
						<div
							class="group flex items-center justify-between rounded-xl border border-black p-6 transition-all duration-300 hover:bg-black dark:border-gray-600">
							<div>
								<h2 class="text-xl font-semibold group-hover:text-white">Deportistas</h2>
								<p class="text-gray-600 group-hover:text-gray-400 dark:text-gray-400">Conoce nuestros deportistas</p>
							</div>
							<div
								class="flex rounded-full bg-black p-4 text-xl text-white group-hover:bg-white group-hover:text-black">
								<Icon name="fa6-solid:person-running" />
							</div>
						</div>
					</NuxtLink>
					<NuxtLink to="/patrocinadores">
						<div
							class="group flex items-center justify-between rounded-xl border border-black p-6 transition-all duration-300 hover:bg-black dark:border-gray-600">
							<div>
								<h2 class="text-xl font-semibold group-hover:text-white">Patrocinadores</h2>
								<p class="text-gray-600 group-hover:text-gray-400 dark:text-gray-400">
									Conoce nuestros patrocinadores
								</p>
							</div>
							<div
								class="flex rounded-full bg-black p-4 text-xl text-white group-hover:bg-white group-hover:text-black">
								<Icon name="fa6-solid:chart-line" />
							</div>
						</div>
					</NuxtLink>
					<NuxtLink to="/marcas">
						<div
							class="group flex items-center justify-between rounded-xl border border-black p-6 transition-all duration-300 hover:bg-black dark:border-gray-600">
							<div>
								<h2 class="text-xl font-semibold group-hover:text-white">Marcas</h2>
								<p class="text-gray-600 group-hover:text-gray-400 dark:text-gray-400">Conoce nuestras marcas</p>
							</div>
							<div
								class="flex rounded-full bg-black p-4 text-xl text-white group-hover:bg-white group-hover:text-black">
								<Icon name="fa6-solid:handshake" />
							</div>
						</div>
					</NuxtLink>
					<NuxtLink to="/nutricionistas">
						<div
							class="group flex items-center justify-between rounded-xl border border-black p-6 transition-all duration-300 hover:bg-black dark:border-gray-600">
							<div>
								<h2 class="text-xl font-semibold group-hover:text-white">Nutricionistas</h2>
								<p class="text-gray-600 group-hover:text-gray-400 dark:text-gray-400">
									Conoce nuestras nutricionistas
								</p>
							</div>
							<div
								class="flex rounded-full bg-black p-4 text-xl text-white group-hover:bg-white group-hover:text-black">
								<Icon name="fa6-solid:user-doctor" />
							</div>
						</div>
					</NuxtLink>
				</div>
			</div>
		</div>

		<!-- Estadísticas -->
		<div v-if="siteStats" class="grid grid-cols-1 gap-6 text-black sm:grid-cols-2 lg:grid-cols-5">
			<stats :endValue="siteStats.deportistas" text="Deportistas" icon="fa6-solid:person-running"></stats>
			<stats :endValue="siteStats.patrocinadores" text="Patrocinadores" icon="fa6-solid:chart-line"></stats>
			<stats :endValue="siteStats.marcas" text="Marcas" icon="fa6-solid:handshake"></stats>
			<stats :endValue="siteStats.nutricionistas" text="Nutricionistas" icon="fa6-solid:user-doctor"></stats>
			<stats :endValue="siteStats.eventos" text="Eventos" icon="fa6-solid:trophy"></stats>
		</div>

		<!-- Noticias -->
		<div>
			<div class="flex flex-col justify-between gap-4 py-12 md:flex-row md:items-center">
				<h2 class="text-6xl text-gray-900 dark:text-white">Noticias</h2>
				<div class="flex items-center gap-4">
					<NuxtLink to="/noticias">
						<div class="group flex items-center gap-2">
							<div class="flex rounded-full bg-black p-4 text-white">
								<Icon name="fa6-solid:right-long"></Icon>
							</div>
							<h2
								class="text-2xl text-gray-400 underline-offset-4 group-hover:text-white group-hover:underline">
								Ver todas las noticias
							</h2>
						</div>
					</NuxtLink>
				<!-- Create button for any authenticated user -->
				<div v-if="authStore.isAuthenticated">
					<NuxtLink to="/admin/noticias/create" class="block">
						<div class="bg-green-400 hover:bg-green-500 rounded-lg shadow-md overflow-hidden transition-all duration-300 transform hover:scale-105 flex items-center justify-center px-6 py-3 gap-2">
							<div class="text-xl font-bold text-white">+</div>
							<div class="text-white font-semibold">Crear</div>
						</div>
					</NuxtLink>
				</div>
				</div>
			</div>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<NewsCard v-for="n in noticiasPreview" :key="n.id" :news="n" />
				<!-- <news
          href=""
          image="/Nutritionist.jpg"
          title="¡Ahora contamos con una amplia variedad de
					nutricionistas verificados!"
          content="Elite Hub sigue creciendo y ahora ofrece una
					selección diversa de nutricionistas certificados,
					incluyendo profesionales extranjeros, para atender a
					todo tipo de público. Todos nuestros expertos han
					sido verificados para garantizar la mejor calidad y
					confianza en cada consulta. ¡Descubre el
					acompañamiento ideal para tu bienestar, sin importar
					tu nivel o país de origen!"
          date="5 de marzo de 2025"
        ></news>
        <news
          href=""
          image="/alliance.jpg"
          title="Elite Hub logra alianza histórica entre marcas
				deportivas"
          content="Nos complace anunciar que Elite Hub ha facilitado
				una alianza estratégica entre reconocidas marcas
				deportivas, impulsando la innovación y el apoyo a
				los deportistas de nuestra comunidad. Esta
				colaboración permitirá el desarrollo de nuevos
				productos, eventos exclusivos y mayores
				oportunidades para todos los miembros de la
				plataforma. ¡Seguimos creciendo juntos y generando
				impacto positivo en el ecosistema deportivo!"
          date="10 de enero de 2025"
        ></news>
        <news
          href=""
          image="/logo.jpeg"
          title="Elite Hub anuncia la apertura de sus operaciones en el mercado nacional"
          content="Elite Hub es la red social líder dedicada a
				potenciar el ecosistema deportivo, conectando a
				deportistas, marcas, patrocinadores, médicos,
				nutricionistas y otros profesionales del sector.
				Nuestra plataforma facilita la creación de
				oportunidades únicas para el crecimiento profesional
				y personal, promoviendo la colaboración, el
				intercambio de conocimientos y el desarrollo de
				alianzas estratégicas. En Elite Hub, impulsamos el
				talento deportivo y fomentamos relaciones sólidas
				entre todos los actores del deporte, generando un
				espacio donde la innovación, el bienestar y el éxito
				se encuentran para transformar vidas y construir un
				futuro más saludable y conectado para la comunidad
				deportiva."
          date="20 de noviembre de 2024"
        ></news> -->
			</div>
		</div>

		<!-- Eventos -->
		<div>
			<div class="flex flex-col justify-between gap-4 py-12 md:flex-row md:items-center">
				<h2 class="text-6xl text-gray-900 dark:text-white">Eventos</h2>
				<div class="flex items-center gap-4">
					<NuxtLink to="/eventos">
						<div class="group flex items-center gap-2">
							<div class="flex rounded-full bg-black p-4 text-white">
								<Icon name="fa6-solid:right-long"></Icon>
							</div>
							<h2
								class="text-2xl text-gray-400 underline-offset-4 group-hover:text-white group-hover:underline">
								Ver todos los eventos
							</h2>
						</div>
					</NuxtLink>
				<div v-if="authStore.isAuthenticated">
					<NuxtLink to="/admin/eventos/create" class="block">
						<div class="bg-green-400 hover:bg-green-500 rounded-lg shadow-md overflow-hidden transition-all duration-300 transform hover:scale-105 flex items-center justify-center px-6 py-3 gap-2">
							<div class="text-xl font-bold text-white">+</div>
							<div class="text-white font-semibold">Crear</div>
						</div>
					</NuxtLink>
				</div>
				</div>
			</div>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<EventCard v-for="e in eventosPreview" :key="e.id" :evento="e" />
				<!-- <events
					image="/maraton.jpg"
					title="Maraton Cali - 2025"
					date="4 de mayo de 2025"
					time="5:00 A.M."
					></events> -->
			</div>
		</div>

		<!-- Publicaciones -->
		<div>
			<div class="flex flex-col justify-between gap-4 py-12 md:flex-row md:items-center">
				<h2 class="text-6xl text-gray-900 dark:text-white">Publicaciones</h2>
				<div v-if="authStore.isAuthenticated" class="flex items-center gap-4">
					<button type="button" @click="showComposer = !showComposer" class="block">
						<div class="bg-green-400 hover:bg-green-500 rounded-lg shadow-md overflow-hidden transition-all duration-300 transform hover:scale-105 flex items-center justify-center px-6 py-3 gap-2">
							<div class="text-xl font-bold text-white">+</div>
							<div class="text-white font-semibold">Crear publicación</div>
						</div>
					</button>
				</div>
			</div>

			<div class="mx-auto max-w-2xl space-y-6">
				<PublicacionComposer v-if="showComposer" @created="onPublicacionCreada" />

				<InfiniteScrollList
					:key="feedKey"
					:fetch-page="fetchPublicaciones"
					grid-class="grid grid-cols-1 gap-4">
					<template #default="{ item }">
						<PublicacionCard :publicacion="item" />
					</template>
					<template #empty>
						<p class="text-center text-gray-600 dark:text-gray-400">No hay publicaciones todavía. Sé el primero en compartir algo.</p>
					</template>
				</InfiniteScrollList>
			</div>
		</div>

		<!-- Testimonios -->
		<!-- <div v-if="carouselTestimonials.length > 0">
      <div
        class="flex flex-col justify-between gap-4 py-12 md:flex-row md:items-center"
      >
        <h2 class="text-6xl text-white">Testimonios</h2>
      </div>
      <app-testimonials [items]="carouselTestimonials"></app-testimonials>
    </div> -->
	</div>
</template>

<script setup lang="ts">
	definePageMeta({
		auth: false,
	});

import { useAuthStore } from '~/stores/auth'
import NewsCard from '~/components/NewsCard.vue'
import EventCard from '~/components/EventCard.vue'
import { ref, onMounted } from 'vue'

const authStore = useAuthStore()
const noticiasPreview = ref([])
const eventosPreview = ref([])
const siteStats = ref<{
	deportistas: number
	patrocinadores: number
	marcas: number
	nutricionistas: number
	eventos: number
} | null>(null)

const feedKey = ref(0)
const showComposer = ref(false)

function fetchPublicaciones(cursor: number | null) {
	return $fetch('/api/publicaciones', { query: { cursor } })
}

function onPublicacionCreada() {
	feedKey.value++
	showComposer.value = false
}

onMounted(async () => {
	try {
		const noticias = await $fetch('/api/noticias')
		const eventos = await $fetch('/api/eventos')
		noticiasPreview.value = (noticias as any[]).slice(0, 5)
		eventosPreview.value = (eventos as any[]).slice(0, 5)
	} catch (err) {
		console.error('Error loading preview data:', err)
	}

	try {
		siteStats.value = await $fetch('/api/stats')
	} catch (err) {
		console.error('Error loading stats:', err)
	}
})
</script>
