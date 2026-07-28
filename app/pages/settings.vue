
<template>
	<div class="mx-auto w-full max-w-[120rem] px-4 py-6">
		<div class="rounded-lg bg-white p-6 shadow-md">
			<h1 class="mb-6 text-2xl font-bold text-gray-800">Ajustes</h1>

			<section class="mb-6 flex items-center justify-between rounded-lg border p-4">
				<div>
					<h2 class="text-lg font-semibold text-gray-800">Tema oscuro</h2>
					<p class="text-sm text-gray-600">Cambia la apariencia de la aplicación entre modo claro y oscuro.</p>
				</div>
				<button
					type="button"
					role="switch"
					:aria-checked="theme === 'dark'"
					aria-label="Tema oscuro"
					@click="toggleTheme"
					class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors"
					:class="theme === 'dark' ? 'bg-green-700' : 'bg-gray-300'">
					<span
						class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
						:class="theme === 'dark' ? 'translate-x-6' : 'translate-x-1'"></span>
				</button>
			</section>
			<div class="sr-only" aria-live="polite">{{ announcement }}</div>

			<div v-if="!isAdmin" class="text-gray-600">Las opciones actuales de perfil se movieron a Perfil.</div>

			<div v-else>
				<p class="mb-4 text-sm text-gray-600">Editor rápido de contenidos públicos. Solo administradores.</p>

				<div class="space-y-6">
					<section class="rounded-lg border p-4">
						<h2 class="mb-2 text-lg font-semibold">Política de Privacidad</h2>
						<input v-model="privacity.title" placeholder="Título" class="mb-2 w-full rounded border px-2 py-1" />
						<input v-model="privacity.subtitle" placeholder="Subtítulo" class="mb-2 w-full rounded border px-2 py-1" />
						<textarea v-model="privacity.content" rows="6" class="w-full rounded border px-2 py-1" placeholder="Contenido HTML o texto"></textarea>
						<div class="mt-2 flex items-center gap-2">
							<button @click="saveContent('privacity')" :disabled="saving" class="rounded bg-green-600 px-3 py-1 text-white">Guardar</button>
							<span v-if="saved.privacity" class="text-sm text-green-600">Guardado</span>
						</div>
					</section>

					<section class="rounded-lg border p-4">
						<h2 class="mb-2 text-lg font-semibold">Términos y Condiciones</h2>
						<input v-model="terms.title" placeholder="Título" class="mb-2 w-full rounded border px-2 py-1" />
						<input v-model="terms.subtitle" placeholder="Subtítulo" class="mb-2 w-full rounded border px-2 py-1" />
						<textarea v-model="terms.content" rows="6" class="w-full rounded border px-2 py-1" placeholder="Contenido HTML o texto"></textarea>
						<div class="mt-2 flex items-center gap-2">
							<button @click="saveContent('terms')" :disabled="saving" class="rounded bg-green-600 px-3 py-1 text-white">Guardar</button>
							<span v-if="saved.terms" class="text-sm text-green-600">Guardado</span>
						</div>
					</section>

					<section class="rounded-lg border p-4">
						<h2 class="mb-2 text-lg font-semibold">Quiénes Somos</h2>
						<input v-model="about.title" placeholder="Título" class="mb-2 w-full rounded border px-2 py-1" />
						<input v-model="about.subtitle" placeholder="Subtítulo" class="mb-2 w-full rounded border px-2 py-1" />
						<textarea v-model="about.content" rows="6" class="w-full rounded border px-2 py-1" placeholder="Contenido HTML o texto"></textarea>
						<div class="mt-2 flex items-center gap-2">
							<button @click="saveContent('about')" :disabled="saving" class="rounded bg-green-600 px-3 py-1 text-white">Guardar</button>
							<span v-if="saved.about" class="text-sm text-green-600">Guardado</span>
						</div>
					</section>
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


