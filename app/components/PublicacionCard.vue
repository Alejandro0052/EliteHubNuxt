<template>
	<div v-if="!eliminada" class="overflow-hidden rounded-xl bg-white shadow-lg transition-transform duration-300 hover:scale-105 dark:bg-neutral-800">
		<div class="p-4">
			<div class="flex items-start justify-between gap-3">
				<div class="flex items-center gap-3">
					<img
						v-if="publicacion.autor.avatar"
						:src="publicacion.autor.avatar"
						class="h-10 w-10 rounded-full object-cover" />
					<div
						v-else
						class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-sm font-semibold text-gray-700 dark:border-gray-500 dark:text-gray-200">
						{{ initials }}
					</div>
					<div>
						<p class="text-sm font-semibold text-gray-900 dark:text-white">
							{{ publicacion.autor.nombre }} {{ publicacion.autor.apellido }}
						</p>
						<p class="text-xs text-gray-500 dark:text-gray-400">
							<span v-if="tipo">{{ tipo }} · </span>{{ relativeTime }}
						</p>
					</div>
				</div>

				<div v-if="canEdit || canDelete" class="flex shrink-0 gap-2">
					<button
						v-if="canEdit && !editing"
						type="button"
						@click="startEdit"
						class="text-sm text-blue-600 hover:underline">
						Editar
					</button>
					<button
						v-if="canDelete"
						type="button"
						@click="handleDelete"
						class="text-sm text-red-600 hover:underline">
						Eliminar
					</button>
				</div>
			</div>

			<form v-if="editing" @submit.prevent="handleEditSubmit" class="mt-3 space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-600">
				<div>
					<label class="mb-1 block text-sm font-medium">Texto</label>
					<textarea v-model="editTexto" rows="3" class="w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-neutral-700 dark:text-white" required></textarea>
				</div>
				<div>
					<label class="mb-1 block text-sm font-medium">Fotos y videos nuevos (opcional, máximo 10; cada video máx. 2 minutos)</label>
					<input ref="mediaInput" type="file" multiple accept="image/*,video/*" @change="onFilesSelected" />
					<p v-if="publicacion.media?.length" class="mt-1 text-xs text-gray-500 dark:text-gray-400">Deja vacío para conservar el carrusel actual.</p>

					<div v-if="editMediaItems.length" class="mt-2 flex flex-wrap gap-2">
						<div v-for="(item, index) in editMediaItems" :key="item.previewUrl" class="relative h-20 w-20 overflow-hidden rounded border border-gray-300 dark:border-gray-600">
							<video v-if="item.type === 'video'" :src="item.previewUrl" muted class="h-full w-full object-cover" />
							<img v-else :src="item.previewUrl" class="h-full w-full object-cover" />
							<button
								type="button"
								class="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-xs text-white"
								@click="removeEditMediaItem(index)">
								<Icon name="fa6-solid:xmark" />
							</button>
						</div>
					</div>
				</div>
				<div class="flex items-center gap-3">
					<button
						:disabled="editSubmitting"
						class="button-primary px-4 py-2 text-sm font-semibold">
						Guardar
					</button>
					<button type="button" @click="cancelEdit" class="text-gray-600 hover:underline dark:text-gray-400">Cancelar</button>
				</div>
			</form>
			<p v-else class="mt-3 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{{ publicacion.texto }}</p>
		</div>

		<div v-if="!editing && publicacion.media?.length" class="relative">
			<video
				v-if="isVideoUrl(publicacion.media[carouselIndex])"
				:src="publicacion.media[carouselIndex]"
				controls
				class="max-h-96 w-full object-cover" />
			<img
				v-else
				:src="publicacion.media[carouselIndex]"
				class="max-h-96 w-full cursor-zoom-in object-cover"
				@click="showLightbox = true" />

			<template v-if="publicacion.media.length > 1">
				<button
					type="button"
					class="absolute top-1/2 left-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white"
					@click="prevMedia">
					<Icon name="fa6-solid:chevron-left" />
				</button>
				<button
					type="button"
					class="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white"
					@click="nextMedia">
					<Icon name="fa6-solid:chevron-right" />
				</button>
				<div class="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
					{{ carouselIndex + 1 }} / {{ publicacion.media.length }}
				</div>
			</template>
		</div>
	</div>

	<Teleport to="body">
		<div
			v-if="showLightbox"
			class="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
			@click="showLightbox = false">
			<button
				type="button"
				class="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg"
				@click.stop="showLightbox = false">
				<Icon name="fa6-solid:xmark" />
			</button>
			<img :src="publicacion.media?.[carouselIndex]" class="max-h-[80vh] max-w-full rounded-lg object-contain" @click.stop />
		</div>
	</Teleport>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { canPerformAction } from '#shared/utils/resourcePermissions'
import { isVideoUrl } from '#shared/utils/media'

const props = defineProps({
	publicacion: { type: Object, required: true },
})

const authStore = useAuthStore()
const { showToast } = useToast()
const { askConfirm } = useConfirm()

const eliminada = ref(false)
const showLightbox = ref(false)
const carouselIndex = ref(0)
const editing = ref(false)
const editTexto = ref('')
const editSubmitting = ref(false)
const mediaInput = ref(null)
const editMediaItems = ref([])

const tipo = computed(() => props.publicacion.autor.informacion?.tipoUsuario?.tipo || '')

const initials = computed(() => {
	const n = props.publicacion.autor.nombre?.charAt(0) || ''
	const a = props.publicacion.autor.apellido?.charAt(0) || ''
	return `${n}${a}`.toUpperCase()
})

const relativeTime = computed(() => {
	const d = new Date(props.publicacion.createdAt)
	const diffMs = Date.now() - d.getTime()
	const diffMin = Math.floor(diffMs / 60000)

	if (diffMin < 1) return 'Hace un momento'
	if (diffMin < 60) return `Hace ${diffMin} minuto${diffMin === 1 ? '' : 's'}`
	const diffHoras = Math.floor(diffMin / 60)
	if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras === 1 ? '' : 's'}`
	const diffDias = Math.floor(diffHoras / 24)
	if (diffDias === 1) return 'Ayer'
	return d.toLocaleDateString()
})

const canEdit = computed(() => {
	const u = authStore.user
	if (!u) return false
	return canPerformAction('publicacion', 'edit', { autorId: props.publicacion.autorId }, { id: u.id, isAdmin: !!u.isAdmin })
})

const canDelete = computed(() => {
	const u = authStore.user
	if (!u) return false
	return canPerformAction('publicacion', 'delete', { autorId: props.publicacion.autorId }, { id: u.id, isAdmin: !!u.isAdmin })
})

function prevMedia() {
	const len = props.publicacion.media.length
	carouselIndex.value = (carouselIndex.value - 1 + len) % len
}

function nextMedia() {
	const len = props.publicacion.media.length
	carouselIndex.value = (carouselIndex.value + 1) % len
}

function startEdit() {
	editTexto.value = props.publicacion.texto
	editing.value = true
}

function resetEditMedia() {
	editMediaItems.value.forEach((item) => URL.revokeObjectURL(item.previewUrl))
	editMediaItems.value = []
}

function cancelEdit() {
	editing.value = false
	resetEditMedia()
	if (mediaInput.value) mediaInput.value.value = ''
}

function probeVideoDuration(file) {
	return new Promise((resolve) => {
		const url = URL.createObjectURL(file)
		const probe = document.createElement('video')
		probe.preload = 'metadata'
		probe.onloadedmetadata = () => {
			if (probe.duration > 120) {
				URL.revokeObjectURL(url)
				showToast(`El video "${file.name}" no puede durar más de 2 minutos`, 'error')
				resolve(null)
			} else {
				resolve({ duration: probe.duration, previewUrl: url })
			}
		}
		probe.src = url
	})
}

async function onFilesSelected(e) {
	const files = Array.from(e.target.files || [])

	for (const file of files) {
		if (editMediaItems.value.length >= 10) {
			showToast('Máximo 10 archivos por publicación', 'error')
			break
		}

		if (file.type.startsWith('image/')) {
			editMediaItems.value.push({ file, type: 'image', previewUrl: URL.createObjectURL(file) })
		} else if (file.type.startsWith('video/')) {
			const probed = await probeVideoDuration(file)
			if (probed) {
				editMediaItems.value.push({ file, type: 'video', duration: probed.duration, previewUrl: probed.previewUrl })
			}
		}
	}

	if (mediaInput.value) mediaInput.value.value = ''
}

function removeEditMediaItem(index) {
	URL.revokeObjectURL(editMediaItems.value[index].previewUrl)
	editMediaItems.value.splice(index, 1)
}

async function handleEditSubmit() {
	const fd = new FormData()
	fd.append('texto', editTexto.value)

	editMediaItems.value.forEach((item, i) => {
		fd.append(`mediaFile_${i}`, item.file)
		if (item.type === 'video') fd.append(`mediaDuration_${i}`, String(item.duration))
	})

	editSubmitting.value = true
	try {
		const actualizada = await $fetch('/api/publicaciones/' + props.publicacion.id, { method: 'PUT', body: fd })
		Object.assign(props.publicacion, actualizada)
		editing.value = false
		carouselIndex.value = 0
		resetEditMedia()
		showToast('Publicación actualizada', 'success')
	} catch (err) {
		console.error(err)
		showToast(err?.data?.message || 'Error al actualizar la publicación', 'error')
	} finally {
		editSubmitting.value = false
	}
}

async function handleDelete() {
	if (!(await askConfirm({ message: '¿Eliminar esta publicación? Esta acción no se puede deshacer.' }))) return
	try {
		await $fetch('/api/publicaciones/' + props.publicacion.id, { method: 'DELETE' })
		eliminada.value = true
		showToast('Publicación eliminada', 'success')
	} catch (err) {
		console.error(err)
		showToast(err?.data?.message || 'Error al eliminar la publicación', 'error')
	}
}
</script>
