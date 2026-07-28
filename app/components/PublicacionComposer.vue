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
			<label for="publicacion-imagen" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Agregar foto (opcional)</label>
			<input id="publicacion-imagen" ref="fileInput" type="file" accept="image/*" class="dark:text-gray-300" />
		</div>

		<button
			:disabled="submitting"
			class="rounded-lg bg-green-700 px-6 py-2 font-semibold text-white transition-colors hover:bg-green-700/80 disabled:bg-gray-400">
			Publicar
		</button>
	</form>
</template>

<script setup>
const emit = defineEmits(['created'])
const { showToast } = useToast()

const texto = ref('')
const fileInput = ref(null)
const submitting = ref(false)

async function handleSubmit() {
	const fd = new FormData()
	fd.append('texto', texto.value)

	const fileEl = fileInput.value
	if (fileEl?.files?.[0]) {
		fd.append('imagenFile', fileEl.files[0])
	}

	submitting.value = true
	try {
		const nueva = await $fetch('/api/publicaciones', { method: 'POST', body: fd })
		emit('created', nueva)
		texto.value = ''
		if (fileEl) fileEl.value = ''
		showToast('Publicación creada', 'success')
	} catch (err) {
		console.error(err)
		showToast(err?.data?.message || 'Error al publicar', 'error')
	} finally {
		submitting.value = false
	}
}
</script>
