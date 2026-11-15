<template>
	<div class="min-h-screen w-full bg-surface-container dark:bg-surface-container-dark">
		<div class="mx-auto max-w-5xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
			<h1 class="form-title !mb-3">Agregar al catálogo</h1>
			<p class="mb-8 max-w-[60ch] text-lg text-on-surface-variant dark:text-on-surface-variant-dark">Publica un producto o servicio de tu marca para que los deportistas lo encuentren.</p>

			<p v-if="tipoUsuarioActual !== 'Marca'" class="form-notice">
				<Icon name="fa6-solid:lock" aria-hidden="true" class="mt-1 shrink-0" />
				Solo las cuentas de tipo Marca pueden publicar en el catálogo.
			</p>
			<form v-else class="form-sheet" @submit.prevent="handleSubmit">
				<p class="form-hint pt-6">Los campos con <span class="text-destructive dark:text-destructive-dark">*</span> son obligatorios.</p>
				<section class="form-section">
					<div>
						<h2 class="form-section-title">El ítem</h2>
						<p class="form-hint mt-2">Así aparecerá en el catálogo y en tu perfil de marca.</p>
					</div>
					<div class="form-grid">
						<div class="form-field sm:col-span-2">
							<label for="nombre" class="form-label">Nombre</label>
							<input id="nombre" v-model="nombre" type="text" class="form-control" required placeholder="Ej.: Guantes de entrenamiento" />
						</div>
						<div class="form-field">
							<label for="tipoItem" class="form-label">Tipo de ítem</label>
							<select id="tipoItem" v-model="tipoItem" class="form-control" required>
								<option value="">Selecciona…</option>
								<option value="SERVICIO">Servicio</option>
								<option value="FISICO">Producto</option>
							</select>
						</div>
						<div class="form-field">
							<label for="categoriaId" class="form-label">Categoría</label>
							<select id="categoriaId" v-model="categoriaId" class="form-control" required>
								<option :value="null">Selecciona…</option>
								<option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
							</select>
						</div>
					</div>
				</section>

				<section class="form-section">
					<div>
						<h2 class="form-section-title">Imágenes</h2>
						<p class="form-hint mt-2">Una o más fotos del producto o servicio.</p>
					</div>
					<div class="form-field">
						<label for="imagen" class="form-label">Imágenes <span class="text-destructive dark:text-destructive-dark">*</span></label>
						<ImageDrop id="imagen" ref="fileInput" multiple required hint="Puedes elegir varias a la vez." />
					</div>
				</section>

				<div class="form-actions">
					<p v-if="error" role="alert" class="form-alert form-alert-error mr-auto">
						<Icon name="fa6-solid:circle-exclamation" aria-hidden="true" class="mt-1 shrink-0 text-destructive dark:text-destructive-dark" />
						{{ error }}
					</p>
					<p v-if="success" role="status" class="form-alert form-alert-success mr-auto">
						<Icon name="fa6-solid:circle-check" aria-hidden="true" class="mt-1 shrink-0 text-primary dark:text-primary-dark" />
						Ítem agregado al catálogo.
					</p>
					<NuxtLink to="/profile" class="button-secondary form-submit focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">Cancelar</NuxtLink>
					<button type="submit" :disabled="loading" class="button-primary form-submit focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
						<Icon v-if="loading" name="fa6-solid:spinner" aria-hidden="true" class="animate-spin motion-reduce:animate-none" />
						{{ loading ? "Agregando…" : "Agregar al catálogo" }}
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

// UserInformacion no declara tipoUsuario (solo lo usan los flujos de registro/edición de perfil),
// pero checkAuth() sí lo popula en tiempo de ejecución desde /api/profile — cast explícito aquí.
const tipoUsuarioActual = computed(() => (authStore.user?.informacion as any)?.tipoUsuario?.tipo ?? null)

const nombre = ref('')
const tipoItem = ref('')
const categoriaId = ref<number | null>(null)
const categorias = ref<{ id: number; nombre: string }[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const error = ref('')
const success = ref(false)

onMounted(async () => {
  try {
    categorias.value = await $fetch('/api/categorias-catalogo')
  } catch (e) {
    console.error('Error cargando categorías:', e)
  }
})

async function handleSubmit() {
  error.value = ''
  success.value = false

  const fd = new FormData()
  fd.append('nombre', nombre.value)
  fd.append('tipoItem', tipoItem.value)
  fd.append('categoriaId', String(categoriaId.value ?? ''))

  const fileEl = fileInput.value
  if (fileEl?.files) {
    for (const file of Array.from(fileEl.files)) {
      fd.append('imagenFile', file)
    }
  }

  loading.value = true
  try {
    await $fetch('/api/catalogo', { method: 'POST', body: fd })
    success.value = true
    await router.push('/profile')
  } catch (e: any) {
    console.error(e)
    error.value = e?.data?.message || e?.message || 'Error al crear el ítem'
  } finally {
    loading.value = false
  }
}
</script>
