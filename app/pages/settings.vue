
<template>
	<div class="w-full min-h-screen bg-surface-container dark:bg-surface-container-dark">
	<div class="mx-auto w-full max-w-[120rem] px-4 py-6">
		<button type="button" @click="router.back()" class="button-secondary mb-6 flex items-center gap-2 px-4 py-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
			<Icon name="fa6-solid:arrow-left" />
			<span>Volver</span>
		</button>

		<div class="p-6 rounded-lg border border-border-hairline bg-surface dark:border-border-hairline-dark dark:bg-surface-container-dark text-on-surface dark:text-on-surface-dark">
			<h1 class="form-title">Ajustes</h1>

			<section class="mb-6 flex items-center justify-between rounded-lg border border-border-hairline p-4 dark:border-border-hairline-dark">
				<div>
					<h2 class="text-lg font-semibold text-on-surface dark:text-on-surface-dark">Tema oscuro</h2>
					<p class="form-hint">Cambia la apariencia de la aplicación entre modo claro y oscuro.</p>
				</div>
				<button
					type="button"
					role="switch"
					:aria-checked="theme === 'dark'"
					aria-label="Tema oscuro"
					@click="toggleTheme"
					class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark"
					:class="theme === 'dark' ? 'bg-primary-dark' : 'bg-gray-400'">
					<span
						class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
						:class="theme === 'dark' ? 'translate-x-6' : 'translate-x-1'"></span>
				</button>
			</section>
			<div class="sr-only" aria-live="polite">{{ announcement }}</div>

			<div v-if="!isAdmin" class="text-on-surface-variant dark:text-on-surface-variant-dark">Las opciones actuales de perfil se movieron a Perfil.</div>

			<div v-else>
				<p class="mb-4 text-on-surface-variant dark:text-on-surface-variant-dark">Editor rápido de contenidos públicos. Solo administradores.</p>

				<div class="space-y-6">
					<section class="rounded-lg border border-border-hairline p-5 sm:p-6 dark:border-border-hairline-dark">
						<h2 class="form-group-title mb-5">Política de privacidad</h2>
						<div class="form-grid">
							<div class="form-field">
								<label for="privacity-title" class="form-label">Título</label>
								<input id="privacity-title" v-model="privacity.title" class="form-control" />
							</div>
							<div class="form-field">
								<label for="privacity-subtitle" class="form-label">Subtítulo</label>
								<input id="privacity-subtitle" v-model="privacity.subtitle" class="form-control" />
							</div>
							<div class="form-field sm:col-span-2">
								<label for="privacity-content" class="form-label">Contenido</label>
								<textarea id="privacity-content" v-model="privacity.content" rows="6" class="form-control"></textarea>
								<p class="form-hint">Texto o HTML.</p>
							</div>
						</div>
						<div class="mt-4 flex items-center gap-3">
							<button type="button" @click="saveContent('privacity')" :disabled="saving" class="button-primary form-submit focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">Guardar cambios</button>
							<span v-if="saved.privacity" role="status" class="inline-flex items-center gap-1.5 font-semibold text-primary dark:text-primary-dark"><Icon name="fa6-solid:circle-check" aria-hidden="true" />Guardado</span>
						</div>
					</section>

					<section class="rounded-lg border border-border-hairline p-5 sm:p-6 dark:border-border-hairline-dark">
						<h2 class="form-group-title mb-5">Términos y condiciones</h2>
						<div class="form-grid">
							<div class="form-field">
								<label for="terms-title" class="form-label">Título</label>
								<input id="terms-title" v-model="terms.title" class="form-control" />
							</div>
							<div class="form-field">
								<label for="terms-subtitle" class="form-label">Subtítulo</label>
								<input id="terms-subtitle" v-model="terms.subtitle" class="form-control" />
							</div>
							<div class="form-field sm:col-span-2">
								<label for="terms-content" class="form-label">Contenido</label>
								<textarea id="terms-content" v-model="terms.content" rows="6" class="form-control"></textarea>
								<p class="form-hint">Texto o HTML.</p>
							</div>
						</div>
						<div class="mt-4 flex items-center gap-3">
							<button type="button" @click="saveContent('terms')" :disabled="saving" class="button-primary form-submit focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">Guardar cambios</button>
							<span v-if="saved.terms" role="status" class="inline-flex items-center gap-1.5 font-semibold text-primary dark:text-primary-dark"><Icon name="fa6-solid:circle-check" aria-hidden="true" />Guardado</span>
						</div>
					</section>

					<section class="rounded-lg border border-border-hairline p-5 sm:p-6 dark:border-border-hairline-dark">
						<h2 class="form-group-title mb-5">Quiénes somos</h2>
						<div class="form-grid">
							<div class="form-field">
								<label for="about-title" class="form-label">Título</label>
								<input id="about-title" v-model="about.title" class="form-control" />
							</div>
							<div class="form-field">
								<label for="about-subtitle" class="form-label">Subtítulo</label>
								<input id="about-subtitle" v-model="about.subtitle" class="form-control" />
							</div>
							<div class="form-field sm:col-span-2">
								<label for="about-content" class="form-label">Contenido</label>
								<textarea id="about-content" v-model="about.content" rows="6" class="form-control"></textarea>
								<p class="form-hint">Texto o HTML.</p>
							</div>
						</div>
						<div class="mt-4 flex items-center gap-3">
							<button type="button" @click="saveContent('about')" :disabled="saving" class="button-primary form-submit focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">Guardar cambios</button>
							<span v-if="saved.about" role="status" class="inline-flex items-center gap-1.5 font-semibold text-primary dark:text-primary-dark"><Icon name="fa6-solid:circle-check" aria-hidden="true" />Guardado</span>
						</div>
					</section>
				</div>
			</div>
		</div>
	</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useContent } from '~/composables/useContent'

const authStore = useAuthStore()
const router = useRouter()
const isAdmin = computed(() => !!authStore.user?.isAdmin)

const { getContent, updateContent } = useContent()
const { theme, announcement, toggleTheme } = useTheme()

const privacity = ref({ page: 'privacity', title: '', subtitle: '', content: '', metadata: {} })
const terms = ref({ page: 'terms', title: '', subtitle: '', content: '', metadata: {} })
const about = ref({ page: 'aboutUs', title: '', subtitle: '', content: '', metadata: {} })

const saving = ref(false)
const saved = ref({ privacity: false, terms: false, about: false })

async function loadAll() {
	if (!isAdmin.value) return
	try {
		const p = await getContent('privacity')
		privacity.value = { page: 'privacity', title: p.title || '', subtitle: p.subtitle || '', content: p.content || '', metadata: p.metadata || {} }
	} catch (e) { console.error(e) }

	try {
		const t = await getContent('terms')
		terms.value = { page: 'terms', title: t.title || '', subtitle: t.subtitle || '', content: t.content || '', metadata: t.metadata || {} }
	} catch (e) { console.error(e) }

	try {
		const a = await getContent('aboutUs')
		about.value = { page: 'aboutUs', title: a.title || '', subtitle: a.subtitle || '', content: a.content || '', metadata: a.metadata || {} }
	} catch (e) { console.error(e) }
}

onMounted(loadAll)

async function saveContent(key: 'privacity' | 'terms' | 'about') {
	if (!isAdmin.value) return
	saving.value = true
	saved.value[key] = false
	try {
		let payload: any = null
		if (key === 'privacity') payload = privacity.value
		if (key === 'terms') payload = terms.value
		if (key === 'about') payload = about.value

		await updateContent(payload.page, payload)
		saved.value[key] = true
		setTimeout(() => (saved.value[key] = false), 2500)
	} catch (e) {
		console.error('Error saving content', e)
	} finally {
		saving.value = false
	}
}
</script>

<style scoped>
/* minimal spacing */
.rounded { }
</style>


