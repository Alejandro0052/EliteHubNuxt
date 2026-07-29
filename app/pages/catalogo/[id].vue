<template>
	<div class="w-full min-h-screen bg-surface-container py-12 px-4 dark:bg-surface-container-dark">
		<button @click="goBack" class="button-secondary px-4 py-2 mb-6 flex items-center gap-2">
			<Icon name="fa6-solid:arrow-left" />
			<span>Volver</span>
		</button>

		<div v-if="loading">Cargando...</div>
		<div v-else-if="!item">No se encontró este ítem.</div>

		<div v-else class="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-lg dark:bg-neutral-800">
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

			<div v-if="item.imagenes?.length" class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
				<img
					v-for="(img, i) in item.imagenes"
					:key="i"
					:src="img"
					class="h-32 w-full cursor-zoom-in rounded-lg object-cover"
					@click="openLightbox(img)" />
			</div>
			<div v-else class="mb-6 flex h-40 items-center justify-center rounded-lg bg-gray-100 text-gray-400 dark:bg-neutral-700">
				<Icon name="fa6-solid:image" class="text-3xl" />
			</div>

			<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">{{ item.nombre }}</h1>
			<div class="mb-4 flex items-center gap-2">
				<span class="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
					{{ item.tipoItem === "SERVICIO" ? "Servicio" : "Físico" }}
				</span>
				<span v-if="item.categoria" class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-neutral-700 dark:text-gray-200">
					{{ item.categoria.nombre }}
				</span>
			</div>

			<p class="text-sm text-gray-600 dark:text-gray-300">
				Ofrecido por
				<NuxtLink :to="`/marcas/${item.usuario?.id}`" class="font-semibold text-black hover:underline dark:text-white">
					{{ item.usuario?.nombre }} {{ item.usuario?.apellido }}
				</NuxtLink>
			</p>
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
