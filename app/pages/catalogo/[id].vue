<template>
	<div class="w-full min-h-screen bg-surface-container px-4 pt-8 pb-16 sm:px-6 lg:px-8 dark:bg-surface-container-dark">
		<button type="button" @click="goBack" class="button-secondary px-4 py-2 mb-6 flex items-center gap-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
			<Icon name="fa6-solid:arrow-left" />
			<span>Volver</span>
		</button>

		<div v-if="loading" class="text-on-surface-variant dark:text-on-surface-variant-dark">Cargando...</div>
		<div v-else-if="!item" class="text-on-surface-variant dark:text-on-surface-variant-dark">No se encontró este ítem.</div>

		<div v-else class="mx-auto max-w-5xl">
			<div class="mb-4 flex items-center gap-3">
				<NuxtLink
					v-if="canEdit"
					:to="`/catalogo/edit/${item.id}`"
					replace
					class="button-primary px-4 py-2">
					Editar
				</NuxtLink>
				<button
					v-if="canDelete"
					@click="handleDelete"
					class="button-destructive px-4 py-2">
					Eliminar
				</button>
			</div>

			<h1
				class="font-display text-5xl leading-[0.9] font-extrabold break-words text-on-surface uppercase sm:text-6xl lg:text-7xl dark:text-on-surface-dark">
				{{ item.nombre }}
			</h1>
			<p class="mt-3 mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-b-2 border-on-surface pb-4 dark:border-on-surface-dark">
				<span class="rounded-sm bg-black px-2 py-0.5 text-[0.8125rem] font-semibold text-white dark:bg-white dark:text-black">
					{{ item.tipoItem === "SERVICIO" ? "Servicio" : "Producto" }}
				</span>
				<span v-if="item.categoria" class="text-on-surface-variant dark:text-on-surface-variant-dark">{{ item.categoria.nombre }}</span>
				<span class="text-on-surface-variant dark:text-on-surface-variant-dark">
					Ofrecido por
					<NuxtLink
						:to="`/marcas/${item.usuario?.id}`"
						class="font-semibold text-primary underline-offset-2 hover:underline dark:text-primary-dark">
						{{ item.usuario?.nombre }} {{ item.usuario?.apellido }}
					</NuxtLink>
				</span>
			</p>

			<div v-if="item.imagenes?.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3">
				<button
					v-for="(img, i) in item.imagenes"
					:key="i"
					type="button"
					:aria-label="`Ampliar imagen ${i + 1}`"
					class="aspect-[4/5] overflow-hidden rounded-lg bg-black focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark"
					@click="openLightbox(img)">
					<img :src="img" alt="" class="h-full w-full cursor-zoom-in object-cover" />
				</button>
			</div>
			<p v-else class="text-on-surface-variant dark:text-on-surface-variant-dark">Este ítem todavía no tiene imágenes.</p>
		</div>

		<Teleport to="body">
			<div
				v-if="lightboxImage"
				class="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
				@click="lightboxImage = null">
				<button
					type="button"
					class="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg"
					@click.stop="lightboxImage = null">
					<Icon name="fa6-solid:xmark" />
				</button>
				<img :src="lightboxImage" class="max-h-[80vh] max-w-full rounded-lg object-contain" @click.stop />
			</div>
		</Teleport>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const item = ref(null)
const loading = ref(true)
const lightboxImage = ref(null)
const { canEdit, canDelete } = useResourcePermissions('catalogo_item', computed(() => (item.value ? { autorId: item.value.usuarioId } : null)))
const { askConfirm } = useConfirm()

const goBack = () => {
	router.back()
}

function openLightbox(img) {
	lightboxImage.value = img
}

onMounted(async () => {
	try {
		item.value = await $fetch('/api/catalogo/' + route.params.id)
	} catch (err) {
		console.error(err)
	} finally {
		loading.value = false
	}
})

async function handleDelete() {
	if (!(await askConfirm({ message: '¿Eliminar este ítem? Esta acción no se puede deshacer.' }))) return
	try {
		await $fetch('/api/catalogo/' + route.params.id, { method: 'DELETE' })
		await router.push('/catalogo')
	} catch (err) {
		console.error(err)
	}
}
</script>
