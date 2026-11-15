<template>
	<form
		class="rounded-lg border border-border-hairline bg-surface dark:border-border-hairline-dark dark:bg-surface-container-dark"
		@submit.prevent="handleSubmit">
		<div class="px-5 pt-5 sm:px-6">
			<h3 class="font-display text-4xl leading-none font-extrabold text-on-surface uppercase dark:text-on-surface-dark">Nueva publicación</h3>

			<div class="form-field mt-4">
				<label for="publicacion-texto" class="form-label">¿Qué quieres compartir?</label>
				<textarea
					id="publicacion-texto"
					v-model="texto"
					rows="4"
					placeholder="Un entrenamiento, un resultado, una idea…"
					class="form-control"
					required></textarea>
			</div>

			<div class="form-field mt-5">
				<div class="flex items-baseline justify-between gap-3">
					<label for="publicacion-media" class="form-label">Fotos y videos</label>
					<span class="form-hint tabular-nums">{{ mediaItems.length }} de {{ MAX_ITEMS }}</span>
				</div>

				<div
					v-if="mediaItems.length < MAX_ITEMS"
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
					<p class="form-hint">Opcional. Hasta {{ MAX_ITEMS }} archivos; cada video, máximo 2 minutos.</p>
					<input
						id="publicacion-media"
						ref="mediaInput"
						type="file"
						multiple
						accept="image/*,video/*"
						class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
						@change="onFilesSelected" />
				</div>

				<ul v-if="mediaItems.length" class="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
					<li
						v-for="(item, index) in mediaItems"
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
							@click="removeMediaItem(index)">
							<Icon name="fa6-solid:xmark" />
						</button>
					</li>
				</ul>
			</div>
		</div>

		<div class="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-border-hairline px-5 py-4 sm:px-6 dark:border-border-hairline-dark">
			<button type="button" :disabled="submitting" class="button-secondary form-submit focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark" @click="emit('cancel')">Cancelar</button>
			<button type="submit" :disabled="submitting" class="button-primary form-submit focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
				<Icon v-if="submitting" name="fa6-solid:spinner" aria-hidden="true" class="animate-spin motion-reduce:animate-none" />
				{{ submitting ? "Publicando…" : "Publicar" }}
			</button>
		</div>
	</form>
</template>

<script setup>
const emit = defineEmits(['created', 'cancel'])
const MAX_ITEMS = 10
const { showToast } = useToast()

const texto = ref('')
const mediaInput = ref(null)
const mediaItems = ref([])
const submitting = ref(false)
const dragging = ref(false)

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
		// Sin esto, un video que el navegador no puede leer dejaba la selección esperando para siempre.
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
		if (mediaItems.value.length >= MAX_ITEMS) {
			showToast(`Máximo ${MAX_ITEMS} archivos por publicación`, 'error')
			break
		}

		if (file.type.startsWith('image/')) {
			mediaItems.value.push({ file, type: 'image', previewUrl: URL.createObjectURL(file) })
		} else if (file.type.startsWith('video/')) {
			const probed = await probeVideoDuration(file)
			if (probed) {
				mediaItems.value.push({ file, type: 'video', duration: probed.duration, previewUrl: probed.previewUrl })
			}
		}
	}

	if (mediaInput.value) mediaInput.value.value = ''
}

function removeMediaItem(index) {
	URL.revokeObjectURL(mediaItems.value[index].previewUrl)
	mediaItems.value.splice(index, 1)
}

function resetMedia() {
	mediaItems.value.forEach((item) => URL.revokeObjectURL(item.previewUrl))
	mediaItems.value = []
}

async function handleSubmit() {
	const fd = new FormData()
	fd.append('texto', texto.value)

	mediaItems.value.forEach((item, i) => {
		fd.append(`mediaFile_${i}`, item.file)
		if (item.type === 'video') fd.append(`mediaDuration_${i}`, String(item.duration))
	})

	submitting.value = true
	try {
		const nueva = await $fetch('/api/publicaciones', { method: 'POST', body: fd })
		texto.value = ''
		resetMedia()
		showToast('Publicación creada', 'success')
		emit('created', nueva)
	} catch (err) {
		// Código y mensaje primero: es lo que hace falta para diagnosticar un fallo al publicar.
		console.error('Error al publicar:', err?.statusCode ?? 'sin código', err?.data?.message || err?.message, err)
		showToast(err?.data?.message || 'No se pudo publicar. Inténtalo de nuevo.', 'error')
	} finally {
		submitting.value = false
	}
}
</script>
