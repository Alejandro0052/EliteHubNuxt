<template>
	<div class="min-h-screen w-full bg-surface-container dark:bg-surface-container-dark">
		<div class="mx-auto max-w-5xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
			<h1 class="form-title !mb-3">Crear noticia</h1>
			<p class="mb-8 max-w-[60ch] text-lg text-on-surface-variant dark:text-on-surface-variant-dark">Comparte una novedad del deporte con la comunidad.</p>

			<p v-if="!authStore.isAuthenticated" class="form-notice">
				<Icon name="fa6-solid:lock" aria-hidden="true" class="mt-1 shrink-0" />
				Inicia sesión para crear una noticia.
			</p>
			<form v-else class="form-sheet" @submit.prevent="handleSubmit">
				<p class="form-hint pt-6">Los campos con <span class="text-destructive dark:text-destructive-dark">*</span> son obligatorios.</p>
				<section class="form-section">
					<div>
						<h2 class="form-section-title">La noticia</h2>
						<p class="form-hint mt-2">El título y el resumen son lo que se ve en la tarjeta.</p>
					</div>
					<div class="form-grid">
						<div class="form-field sm:col-span-2">
							<label for="titulo" class="form-label">Título</label>
							<input id="titulo" v-model="titulo" type="text" class="form-control" required />
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
						<h2 class="form-section-title">Contenido</h2>
						<p class="form-hint mt-2">El texto completo de la noticia.</p>
					</div>
					<div class="form-field">
						<label for="contenido" class="form-label">Contenido</label>
						<textarea id="contenido" v-model="contenido" rows="10" class="form-control"></textarea>
						<p class="form-hint">Puedes usar etiquetas HTML para dar formato.</p>
					</div>
				</section>

				<section class="form-section">
					<div>
						<h2 class="form-section-title">Imagen</h2>
						<p class="form-hint mt-2">Se muestra en la tarjeta y al abrir la noticia.</p>
					</div>
					<div class="form-field">
						<label for="imagen" class="form-label">Imagen de la noticia</label>
						<ImageDrop id="imagen" ref="fileInput" hint="Horizontal se ve mejor." />
					</div>
				</section>

				<div class="form-actions">
					<p v-if="error" role="alert" class="form-alert form-alert-error mr-auto">
						<Icon name="fa6-solid:circle-exclamation" aria-hidden="true" class="mt-1 shrink-0 text-destructive dark:text-destructive-dark" />
						{{ error }}
					</p>
					<p v-if="success" role="status" class="form-alert form-alert-success mr-auto">
						<Icon name="fa6-solid:circle-check" aria-hidden="true" class="mt-1 shrink-0 text-primary dark:text-primary-dark" />
						Noticia publicada.
					</p>
					<NuxtLink to="/noticias" replace class="button-secondary form-submit focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">Cancelar</NuxtLink>
					<button type="submit" :disabled="loading" class="button-primary form-submit focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
						<Icon v-if="loading" name="fa6-solid:spinner" aria-hidden="true" class="animate-spin motion-reduce:animate-none" />
						{{ loading ? "Publicando…" : "Publicar noticia" }}
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const titulo = ref('')
const resumen = ref('')
const contenido = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const error = ref('')
const success = ref(false)

async function handleSubmit() {
  error.value = ''
  success.value = false
  if (!authStore.isAuthenticated) {
    error.value = 'Debes iniciar sesión para crear una noticia.'
    return
  }

  const fd = new FormData()
  fd.append('titulo', titulo.value)
  fd.append('resumen', resumen.value || '')
  fd.append('contenido', contenido.value || '')

  const fileEl = fileInput.value
  if (fileEl?.files?.[0]) {
    fd.append('imageFile', fileEl.files[0])
  }

  loading.value = true
  try {
    const res = await $fetch('/api/noticias', { method: 'POST', body: fd })
    success.value = true
    // redirect to news listing or the created item if id returned
    await router.push('/noticias')
  } catch (e: any) {
    console.error(e)
    error.value = e?.message || 'Error al crear noticia'
  } finally {
    loading.value = false
  }
}
</script>
