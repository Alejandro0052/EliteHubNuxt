<template>
	<div class="min-h-screen w-full bg-surface-container dark:bg-surface-container-dark">
		<div class="mx-auto max-w-5xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
			<h1 class="form-title !mb-3">Editar evento</h1>
			<p class="mb-8 max-w-[60ch] text-lg text-on-surface-variant dark:text-on-surface-variant-dark">Cambia los datos del evento. Lo que no toques queda igual.</p>

			<p v-if="loading" class="text-on-surface-variant dark:text-on-surface-variant-dark">Cargando…</p>
			<p v-else-if="!canEdit" class="form-notice">
				<Icon name="fa6-solid:lock" aria-hidden="true" class="mt-1 shrink-0" />
				No tienes permiso para editar este evento.
			</p>
			<form v-else class="form-sheet" @submit.prevent="handleSubmit">
				<p class="form-hint pt-6">Los campos con <span class="text-destructive dark:text-destructive-dark">*</span> son obligatorios.</p>
				<section class="form-section">
					<div>
						<h2 class="form-section-title">El evento</h2>
						<p class="form-hint mt-2">El título y el resumen son lo que se ve en la tarjeta del evento.</p>
					</div>
					<div class="form-grid">
						<div class="form-field sm:col-span-2">
							<label for="titulo" class="form-label">Título</label>
							<input id="titulo" v-model="titulo" type="text" class="form-control" required placeholder="Ej.: Carrera 10K de la ciudad" />
						</div>
						<div class="form-field sm:col-span-2">
							<label for="resumen" class="form-label">Resumen</label>
							<input id="resumen" v-model="resumen" type="text" class="form-control" />
							<p class="form-hint">Una o dos frases.</p>
						</div>
					</div>
				</section>

				<section class="form-section">
					<div>
						<h2 class="form-section-title">Cuándo y dónde</h2>
						<p class="form-hint mt-2">La fecha aparece destacada sobre la imagen.</p>
					</div>
					<div class="form-grid">
						<div class="form-field">
							<label for="fechaEvento" class="form-label">Fecha del evento</label>
							<input id="fechaEvento" v-model="fechaEvento" type="date" class="form-control" />
						</div>
						<div class="form-field">
							<label for="ubicacion" class="form-label">Ubicación</label>
							<input id="ubicacion" v-model="ubicacion" type="text" class="form-control" placeholder="Ciudad o lugar" />
						</div>
					</div>
				</section>

				<section class="form-section">
					<div>
						<h2 class="form-section-title">Detalle</h2>
						<p class="form-hint mt-2">Todo lo que alguien necesita saber para asistir.</p>
					</div>
					<div class="form-field">
						<label for="contenido" class="form-label">Contenido</label>
						<textarea id="contenido" v-model="contenido" rows="8" class="form-control"></textarea>
					</div>
				</section>

				<section class="form-section">
					<div>
						<h2 class="form-section-title">Imagen</h2>
						<p class="form-hint mt-2">Se muestra en la tarjeta y al abrir el evento.</p>
					</div>
					<div class="form-field">
						<label for="imagen" class="form-label">Imagen del evento</label>
						<ImageDrop id="imagen" ref="fileInput" hint="Si no eliges nada, se conserva la actual." :current="evento?.imagen" />
					</div>
				</section>

				<div class="form-actions">
					<p v-if="error" role="alert" class="form-alert form-alert-error mr-auto">
						<Icon name="fa6-solid:circle-exclamation" aria-hidden="true" class="mt-1 shrink-0 text-destructive dark:text-destructive-dark" />
						{{ error }}
					</p>
					<p v-if="success" role="status" class="form-alert form-alert-success mr-auto">
						<Icon name="fa6-solid:circle-check" aria-hidden="true" class="mt-1 shrink-0 text-primary dark:text-primary-dark" />
						Cambios guardados.
					</p>
					<NuxtLink :to="`/eventos/${route.params.id}`" replace class="button-secondary form-submit focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">Cancelar</NuxtLink>
					<button type="submit" :disabled="saving" class="button-primary form-submit focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
						<Icon v-if="saving" name="fa6-solid:spinner" aria-hidden="true" class="animate-spin motion-reduce:animate-none" />
						{{ saving ? "Guardando…" : "Guardar cambios" }}
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const evento = ref<any>(null)
const loading = ref(true)
const { canEdit } = useResourcePermissions('evento_noticia', evento)

const titulo = ref('')
const resumen = ref('')
const contenido = ref('')
const fechaEvento = ref('')
const ubicacion = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const saving = ref(false)
const error = ref('')
const success = ref(false)

onMounted(async () => {
  try {
    evento.value = await $fetch(`/api/eventos/${route.params.id}`)
    titulo.value = evento.value.titulo || ''
    resumen.value = evento.value.resumen || ''
    contenido.value = evento.value.contenido || ''
    ubicacion.value = evento.value.ubicacion || ''
    if (evento.value.fechaEvento) {
      fechaEvento.value = new Date(evento.value.fechaEvento).toISOString().slice(0, 10)
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  error.value = ''
  success.value = false

  const fd = new FormData()
  fd.append('titulo', titulo.value)
  fd.append('resumen', resumen.value || '')
  fd.append('contenido', contenido.value || '')
  fd.append('fechaEvento', fechaEvento.value || '')
  fd.append('ubicacion', ubicacion.value || '')

  const fileEl = fileInput.value
  if (fileEl?.files?.[0]) {
    fd.append('imageFile', fileEl.files[0])
  }

  saving.value = true
  try {
    await $fetch(`/api/eventos/${route.params.id}`, { method: 'PUT', body: fd })
    success.value = true
    await router.push(`/eventos/${route.params.id}`)
  } catch (e: any) {
    console.error(e)
    error.value = e?.message || 'Error al actualizar evento'
  } finally {
    saving.value = false
  }
}
</script>
