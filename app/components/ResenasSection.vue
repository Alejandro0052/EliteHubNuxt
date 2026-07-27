<template>
	<div class="mx-auto mt-8 max-w-3xl rounded-xl bg-white p-8 shadow-lg">
		<h2 class="mb-4 text-xl font-bold text-gray-900">Reseñas</h2>

		<div v-if="loading">Cargando reseñas...</div>

		<template v-else>
			<div v-if="!authStore.isAuthenticated" class="mb-6 text-sm text-gray-500">
				Inicia sesión para dejar una reseña.
			</div>

			<div v-else-if="misResena" class="mb-6 text-sm font-medium text-gray-700">
				Ya dejaste una reseña para {{ nutricionistaNombre }}
			</div>

			<div v-else class="mb-6">
				<button
					v-if="!showForm"
					type="button"
					@click="showForm = true"
					class="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors">
					Dejar una reseña
				</button>

				<form v-else @submit.prevent="handleSubmit" class="space-y-3 rounded-lg border border-gray-200 p-4">
					<div>
						<label class="mb-1 block text-sm font-medium">Calificación</label>
						<div class="flex gap-1" role="group" aria-label="Selecciona una calificación">
							<button
								v-for="n in 5"
								:key="n"
								type="button"
								:aria-label="`Calificar con ${n} de 5 estrellas`"
								:aria-pressed="rating === n"
								@click="rating = n"
								class="text-2xl text-yellow-500">
								<Icon :name="n <= rating ? 'fa6-solid:star' : 'fa6-regular:star'" />
							</button>
						</div>
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium">Comentario (opcional)</label>
						<textarea v-model="comentario" rows="3" class="w-full rounded border px-3 py-2"></textarea>
					</div>

					<div class="flex items-center gap-3">
						<button
							:disabled="submitting"
							class="bg-green-400 hover:bg-green-500 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
							Publicar
						</button>
						<button
							type="button"
							@click="showForm = false"
							class="text-gray-600 hover:underline">
							Cancelar
						</button>
					</div>
				</form>
			</div>

			<div v-if="resenas.length > 0" class="mb-6 flex flex-col items-center gap-1 border-b border-gray-100 pb-6 text-center">
				<div class="flex items-center gap-2">
					<StarRating :value="promedio" class="text-2xl" />
					<span class="text-xl font-bold text-gray-900">{{ promedio.toFixed(1) }}</span>
				</div>
				<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Calificación</p>
			</div>

			<div v-if="resenas.length === 0" class="text-sm text-gray-500">Todavía no hay reseñas.</div>

			<ul v-else class="space-y-4">
				<li v-for="r in resenasOrdenadas" :key="r.id" class="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
					<div class="flex items-start justify-between gap-3">
						<div class="flex items-center gap-3">
							<img
								v-if="r.autor.avatar"
								:src="r.autor.avatar"
								class="h-10 w-10 rounded-full object-cover" />
							<div
								v-else
								class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-sm font-semibold text-gray-700">
								{{ initials(r.autor) }}
							</div>
							<div>
								<p class="text-sm font-semibold text-gray-900">{{ r.autor.nombre }} {{ r.autor.apellido }}</p>
								<StarRating :value="r.rating" class="text-sm" />
							</div>
						</div>

						<div
							v-if="permisos(r).canEdit || permisos(r).canDelete || permisos(r).canRetract"
							class="flex shrink-0 gap-2">
							<button
								v-if="permisos(r).canEdit && editingId !== r.id"
								type="button"
								@click="startEdit(r)"
								class="text-sm text-blue-600 hover:underline">
								Editar
							</button>
							<button
								v-if="permisos(r).canDelete"
								type="button"
								@click="handleDelete(r)"
								class="text-sm text-red-600 hover:underline">
								Eliminar
							</button>
							<button
								v-if="permisos(r).canRetract && retractingId !== r.id"
								type="button"
								@click="startRetract(r)"
								class="text-sm text-red-600 hover:underline">
								Retractar
							</button>
						</div>
					</div>

					<div v-if="retractingId === r.id" class="mt-3 space-y-3 rounded-lg border border-gray-200 p-4">
						<p class="text-sm text-gray-700">¿Retractar esta reseña? Esta acción no se puede deshacer.</p>
						<label class="flex items-center gap-2 text-sm text-gray-700">
							<input type="checkbox" v-model="bloquearAutor" />
							También bloquear la cuenta de {{ r.autor.nombre }} {{ r.autor.apellido }}
						</label>
						<div class="flex items-center gap-3">
							<button
								:disabled="retractSubmitting"
								type="button"
								@click="handleRetract(r)"
								class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:bg-gray-400">
								Confirmar
							</button>
							<button type="button" @click="retractingId = null" class="text-gray-600 hover:underline">Cancelar</button>
						</div>
					</div>

					<form
						v-if="editingId === r.id"
						@submit.prevent="handleEditSubmit(r)"
						class="mt-3 space-y-3 rounded-lg border border-gray-200 p-4">
						<div>
							<label class="mb-1 block text-sm font-medium">Calificación</label>
							<div class="flex gap-1" role="group" aria-label="Selecciona una calificación">
								<button
									v-for="n in 5"
									:key="n"
									type="button"
									:aria-label="`Calificar con ${n} de 5 estrellas`"
									:aria-pressed="editRating === n"
									@click="editRating = n"
									class="text-2xl text-yellow-500">
									<Icon :name="n <= editRating ? 'fa6-solid:star' : 'fa6-regular:star'" />
								</button>
							</div>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium">Comentario (opcional)</label>
							<textarea v-model="editComentario" rows="3" class="w-full rounded border px-3 py-2"></textarea>
						</div>
						<div class="flex items-center gap-3">
							<button
								:disabled="editSubmitting"
								class="bg-green-400 hover:bg-green-500 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
								Guardar
							</button>
							<button type="button" @click="editingId = null" class="text-gray-600 hover:underline">Cancelar</button>
						</div>
					</form>
					<p v-else-if="r.comentario" class="mt-2 text-sm text-gray-700">{{ r.comentario }}</p>
				</li>
			</ul>
		</template>
	</div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { canPerformAction } from '#shared/utils/resourcePermissions'

const props = defineProps({
	nutricionistaId: { type: Number, required: true },
	nutricionistaNombre: { type: String, required: true },
})

const authStore = useAuthStore()
const { showToast } = useToast()
const { askConfirm } = useConfirm()

const resenas = ref([])
const loading = ref(true)
const showForm = ref(false)
const submitting = ref(false)
const rating = ref(0)
const comentario = ref('')

const editingId = ref(null)
const editRating = ref(0)
const editComentario = ref('')
const editSubmitting = ref(false)

const retractingId = ref(null)
const bloquearAutor = ref(false)
const retractSubmitting = ref(false)

const misResena = computed(() => resenas.value.find((r) => r.autorId === authStore.user?.id))

const resenasOrdenadas = computed(() => {
	if (!misResena.value) return resenas.value
	return [misResena.value, ...resenas.value.filter((r) => r.id !== misResena.value.id)]
})

const promedio = computed(() => {
	if (resenas.value.length === 0) return 0
	const suma = resenas.value.reduce((acc, r) => acc + r.rating, 0)
	return suma / resenas.value.length
})

function initials(autor) {
	const n = autor.nombre?.charAt(0) || ''
	const a = autor.apellido?.charAt(0) || ''
	return `${n}${a}`.toUpperCase()
}

function permisos(r) {
	const u = authStore.user
	if (!u) return { canEdit: false, canDelete: false, canRetract: false }
	const actor = { id: u.id, isAdmin: !!u.isAdmin }
	return {
		canEdit: canPerformAction('resena', 'edit', { autorId: r.autorId }, actor),
		canDelete: canPerformAction('resena', 'delete', { autorId: r.autorId }, actor),
		canRetract: canPerformAction('resena', 'retract', { autorId: r.autorId }, actor),
	}
}

async function loadResenas() {
	loading.value = true
	try {
		resenas.value = await $fetch('/api/resenas', { query: { nutricionistaId: props.nutricionistaId } })
	} catch (err) {
		console.error(err)
	} finally {
		loading.value = false
	}
}

async function handleSubmit() {
	if (!rating.value) {
		showToast('Selecciona una calificación', 'error')
		return
	}

	submitting.value = true
	try {
		const nueva = await $fetch('/api/resenas', {
			method: 'POST',
			body: { nutricionistaId: props.nutricionistaId, rating: rating.value, comentario: comentario.value },
		})
		resenas.value.unshift(nueva)
		showForm.value = false
		rating.value = 0
		comentario.value = ''
		showToast('Reseña publicada', 'success')
	} catch (err) {
		console.error(err)
		showToast(err?.data?.message || 'Error al publicar la reseña', 'error')
	} finally {
		submitting.value = false
	}
}

function startEdit(r) {
	editingId.value = r.id
	editRating.value = r.rating
	editComentario.value = r.comentario
}

async function handleEditSubmit(r) {
	if (!editRating.value) {
		showToast('Selecciona una calificación', 'error')
		return
	}

	editSubmitting.value = true
	try {
		const actualizada = await $fetch('/api/resenas/' + r.id, {
			method: 'PUT',
			body: { rating: editRating.value, comentario: editComentario.value },
		})
		const idx = resenas.value.findIndex((x) => x.id === r.id)
		if (idx !== -1) resenas.value[idx] = actualizada
		editingId.value = null
		showToast('Reseña actualizada', 'success')
	} catch (err) {
		console.error(err)
		showToast(err?.data?.message || 'Error al actualizar la reseña', 'error')
	} finally {
		editSubmitting.value = false
	}
}

function startRetract(r) {
	retractingId.value = r.id
	bloquearAutor.value = false
}

async function handleRetract(r) {
	retractSubmitting.value = true
	try {
		const res = await $fetch('/api/resenas/' + r.id + '/retract', {
			method: 'PATCH',
			body: { bloquearAutor: bloquearAutor.value },
		})
		resenas.value = resenas.value.filter((x) => x.id !== r.id)
		retractingId.value = null
		showToast(res.autorBloqueado ? 'Reseña retractada y cuenta bloqueada' : 'Reseña retractada', 'success')
	} catch (err) {
		console.error(err)
		showToast(err?.data?.message || 'Error al retractar la reseña', 'error')
	} finally {
		retractSubmitting.value = false
	}
}

async function handleDelete(r) {
	if (!(await askConfirm({ message: '¿Eliminar esta reseña? Esta acción no se puede deshacer.' }))) return
	try {
		await $fetch('/api/resenas/' + r.id, { method: 'DELETE' })
		resenas.value = resenas.value.filter((x) => x.id !== r.id)
		showToast('Reseña eliminada', 'success')
	} catch (err) {
		console.error(err)
		showToast(err?.data?.message || 'Error al eliminar la reseña', 'error')
	}
}

onMounted(loadResenas)
</script>
