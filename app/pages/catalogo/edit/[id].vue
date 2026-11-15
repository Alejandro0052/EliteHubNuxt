<template>
	<div class="min-h-screen w-full bg-surface-container dark:bg-surface-container-dark">
		<div class="mx-auto max-w-5xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
			<h1 class="form-title !mb-3">Editar ítem</h1>
			<p class="mb-8 max-w-[60ch] text-lg text-on-surface-variant dark:text-on-surface-variant-dark">Cambia los datos del ítem. Lo que no toques queda igual.</p>

			<p v-if="loading" class="text-on-surface-variant dark:text-on-surface-variant-dark">Cargando…</p>
			<p v-else-if="!canEdit" class="form-notice">
				<Icon name="fa6-solid:lock" aria-hidden="true" class="mt-1 shrink-0" />
				No tienes permiso para editar este ítem.
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
								<option value="SERVICIO">Servicio</option>
								<option value="FISICO">Producto</option>
							</select>
						</div>
						<div class="form-field">
							<label for="categoriaId" class="form-label">Categoría</label>
							<select id="categoriaId" v-model="categoriaId" class="form-control" required>
								<option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
							</select>
						</div>
					</div>
				</section>

				<section class="form-section">
					<div>
						<h2 class="form-section-title">Imágenes</h2>
						<p class="form-hint mt-2">Solo si quieres cambiarlas.</p>
					</div>
					<div class="form-field">
						<label for="imagen" class="form-label">Imágenes nuevas</label>
						<ImageDrop id="imagen" ref="fileInput" multiple hint="Si no eliges nada, se conservan las actuales." :current="item?.imagenes || []" />
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
					<NuxtLink :to="`/catalogo/${route.params.id}`" replace class="button-secondary form-submit focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">Cancelar</NuxtLink>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const item = ref<any>(null)
const loading = ref(true)
const { canEdit } = useResourcePermissions('catalogo_item', computed(() => (item.value ? { autorId: item.value.usuarioId } : null)))

const categorias = ref<{ id: number; nombre: string }[]>([])
const nombre = ref('')
const tipoItem = ref('')
const categoriaId = ref<number | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const saving = ref(false)
const error = ref('')
const success = ref(false)

onMounted(async () => {
  try {
    item.value = await $fetch('/api/catalogo/' + route.params.id)
    nombre.value = item.value.nombre || ''
    tipoItem.value = item.value.tipoItem || ''
    categoriaId.value = item.value.categoriaId ?? null
    categorias.value = await $fetch('/api/categorias-catalogo')
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
  fd.append('nombre', nombre.value)
  fd.append('tipoItem', tipoItem.value)
  fd.append('categoriaId', String(categoriaId.value ?? ''))

  const fileEl = fileInput.value
  if (fileEl?.files) {
    for (const file of Array.from(fileEl.files)) {
      fd.append('imagenFile', file)
    }
  }

  saving.value = true
  try {
    await $fetch('/api/catalogo/' + route.params.id, { method: 'PUT', body: fd })
    success.value = true
    // replace, no push: evita apilar la vista de edición en el historial, para que
    // "Volver" desde el detalle no regrese aquí sino a la vista donde estaba antes de editar.
    await router.replace(`/catalogo/${route.params.id}`)
  } catch (e: any) {
    console.error(e)
    error.value = e?.data?.message || 'Error al actualizar el ítem'
  } finally {
    saving.value = false
  }
}
</script>
