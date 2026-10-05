<template>
	<form @submit.prevent="handleSubmit" class="space-y-3 rounded-xl bg-white p-6 shadow-lg dark:bg-neutral-800">
		<div>
			<label for="publicacion-texto" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">¿Qué quieres compartir?</label>
			<textarea
				id="publicacion-texto"
				v-model="texto"
				rows="3"
				class="w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-neutral-700 dark:text-white"
				required></textarea>
		</div>

		<div>
			<label for="publicacion-media" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
				Fotos y videos (opcional, máximo 10; cada video máx. 2 minutos)
			</label>
			<input
				id="publicacion-media"
				ref="mediaInput"
				type="file"
				multiple
				accept="image/*,video/*"
				class="dark:text-gray-300"
				@change="onFilesSelected" />

			<div v-if="mediaItems.length" class="mt-2 flex flex-wrap gap-2">
				<div v-for="(item, index) in mediaItems" :key="item.previewUrl" class="relative h-20 w-20 overflow-hidden rounded border border-gray-300 dark:border-gray-600">
					<video v-if="item.type === 'video'" :src="item.previewUrl" muted class="h-full w-full object-cover" />
					<img v-else :src="item.previewUrl" class="h-full w-full object-cover" />
					<button
						type="button"
						class="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-xs text-white"
						@click="removeMediaItem(index)">
						<Icon name="fa6-solid:xmark" />
					</button>
				</div>
			</div>
		</div>

		<button
			:disabled="submitting"
			class="button-primary px-6 py-2 font-semibold">
			Publicar
		</button>
	</form>
</template>

<script setup>
const emit = defineEmits(['created'])
const { showToast } = useToast()

const texto = ref('')
const mediaInput = ref(null)
const mediaItems = ref([])
const submitting = ref(false)

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
		if (mediaItems.value.length >= 10) {
			showToast('Máximo 10 archivos por publicación', 'error')
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
		emit('created', nueva)
		texto.value = ''
		resetMedia()
		showToast('Publicación creada', 'success')
	} catch (err) {
		console.error(err)
		showToast(err?.data?.message || 'Error al publicar', 'error')
	} finally {
		submitting.value = false
	}
}
</script>
