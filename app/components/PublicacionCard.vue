<template>
	<div v-if="!eliminada" :class="{ 'card-lift': !editing }" class="overflow-hidden rounded-lg border border-border-hairline bg-surface dark:border-border-hairline-dark dark:bg-surface-container-dark">
		<div class="p-4">
			<div class="flex items-start justify-between gap-3">
				<div class="flex items-center gap-3">
					<img
						v-if="publicacion.autor.avatar"
						:src="publicacion.autor.avatar"
						alt="" class="h-11 w-11 rounded-full object-cover" />
					<div
						v-else
						class="flex h-11 w-11 items-center justify-center rounded-full bg-black font-display text-xl font-extrabold text-white">
						{{ initials }}
					</div>
					<div>
						<p class="font-semibold text-on-surface dark:text-on-surface-dark">
							{{ publicacion.autor.nombre }} {{ publicacion.autor.apellido }}
						</p>
						<p class="text-sm text-on-surface-variant dark:text-on-surface-variant-dark">
							<span v-if="tipo" class="font-semibold text-primary dark:text-primary-dark">{{ tipo }}</span><span v-if="tipo">, </span>{{ relativeTime }}
						</p>
					</div>
				</div>

				<div v-if="canEdit || canDelete" class="flex shrink-0 gap-2">
					<button
						v-if="canEdit && !editing"
						type="button"
						@click="startEdit"
						class="text-sm font-semibold text-primary hover:underline dark:text-primary-dark">
						Editar
					</button>
					<button
						v-if="canDelete"
						type="button"
						@click="handleDelete"
						class="text-sm font-semibold text-destructive hover:underline dark:text-destructive-dark">
						Eliminar
					</button>
				</div>
			</div>

			<form
				v-if="editing"
				class="mt-4 rounded-lg border border-border-hairline dark:border-border-hairline-dark"
				@submit.prevent="handleEditSubmit">
				<div class="px-4 pt-4 sm:px-5">
					<h3 class="font-display text-3xl leading-none font-extrabold text-on-surface uppercase dark:text-on-surface-dark">Editar publicación</h3>

					<div class="form-field mt-4">
						<label :for="`publicacion-texto-${publicacion.id}`" class="form-label">Texto</label>
						<textarea :id="`publicacion-texto-${publicacion.id}`" v-model="editTexto" rows="4" class="form-control" required></textarea>
					</div>

					<div class="form-field mt-5">
						<div class="flex items-baseline justify-between gap-3">
							<label :for="`publicacion-media-${publicacion.id}`" class="form-label">Fotos y videos nuevos</label>
							<span class="form-hint tabular-nums">{{ editMediaItems.length }} de {{ MAX_ITEMS }}</span>
						</div>

						<div
							v-if="editMediaItems.length < MAX_ITEMS"
							class="form-drop !py-6"
							:class="{ 'form-drop-active': dragging }"
							@dragenter="dragging = true"
							@dragleave="dragging = false"
							@drop="dragging = false">
							<Icon name="fa6-solid:photo-film" aria-hidden="true" class="text-2xl text-on-surface-variant dark:text-on-surface-variant-dark" />
							<p class="text-on-surface dark:text-on-surface-dark">
								<span class="font-semibold text-primary dark:text-primary-dark">Elige fotos o videos</span>
								o arrástralos hasta aquí
							</p>
							<p class="form-hint">
								{{ publicacion.media?.length ? "Si no eliges nada, se conservan los actuales." : "Opcional." }}
								Hasta {{ MAX_ITEMS }} archivos; cada video, máximo 2 minutos.
							</p>
							<input
								:id="`publicacion-media-${publicacion.id}`"
								ref="mediaInput"
								type="file"
								multiple
								accept="image/*,video/*"
								class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
								@change="onFilesSelected" />
						</div>

						<ul v-if="editMediaItems.length" class="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
							<li
								v-for="(item, index) in editMediaItems"
								:key="item.previewUrl"
								class="relative aspect-square overflow-hidden rounded-md bg-black">
								<video v-if="item.type === 'video'" :src="item.previewUrl" muted class="h-full w-full object-cover" />
								<img v-else :src="item.previewUrl" alt="" class="h-full w-full object-cover" />
								<span
									v-if="item.type === 'video'"
									class="absolute bottom-1 left-1 flex items-center gap-1 rounded-sm bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-white">
									<Icon name="fa6-solid:video" aria-hidden="true" />
									Video
								</span>
								<button
									type="button"
									:aria-label="`Quitar archivo ${index + 1}`"
									class="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-sm text-white transition hover:scale-110 hover:bg-black focus-visible:outline-2 focus-visible:outline-white motion-reduce:transition-none motion-reduce:hover:transform-none"
									@click="removeEditMediaItem(index)">
									<Icon name="fa6-solid:xmark" />
								</button>
							</li>
						</ul>
					</div>
				</div>

				<div class="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-border-hairline px-4 py-4 sm:px-5 dark:border-border-hairline-dark">
					<button type="button" :disabled="editSubmitting" class="button-secondary form-submit focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark" @click="cancelEdit">Cancelar</button>
					<button type="submit" :disabled="editSubmitting" class="button-primary form-submit focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
						<Icon v-if="editSubmitting" name="fa6-solid:spinner" aria-hidden="true" class="animate-spin motion-reduce:animate-none" />
						{{ editSubmitting ? "Guardando…" : "Guardar cambios" }}
					</button>
				</div>
			</form>
			<p v-else class="mt-3 whitespace-pre-wrap text-on-surface dark:text-on-surface-dark">{{ publicacion.texto }}</p>
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
const dragging = ref(false)
const MAX_ITEMS = 10

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
		probe.onerror = () => {
			URL.revokeObjectURL(url)
			showToast(`No se pudo leer el video "${file.name}"`, 'error')
			resolve(null)
		}
		probe.src = url
	})
}

async function onFilesSelected(e) {
	const files = Array.from(e.target.files || [])

	for (const file of files) {
		if (editMediaItems.value.length >= MAX_ITEMS) {
			showToast(`Máximo ${MAX_ITEMS} archivos por publicación`, 'error')
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
