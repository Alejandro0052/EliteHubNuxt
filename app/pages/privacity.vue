<template>
	<div class="min-h-screen w-full bg-surface-container dark:bg-surface-container-dark">
		<div class="max-w-page-shell mx-auto px-4 pt-8 pb-16 sm:px-6 lg:px-8">
			<ContentEditor page="privacity" :initial-content="content" @updated="handleContentUpdate" />

			<DirectoryHeader :title="content.title || 'Política de privacidad'" :subtitle="content.subtitle || 'Última actualización: enero de 2024'" />

			<div v-if="content.content" class="rich-text mt-10" v-html="content.content" />
			<p v-else class="mt-10 max-w-[65ch] text-lg text-on-surface-variant dark:text-on-surface-variant-dark">
				La política de privacidad todavía no está publicada. Si eres administrador, puedes escribirla con el botón de editar.
			</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
definePageMeta({
	auth: false,
	title: 'Política de Privacidad - EliteHub',
	description: 'Política de privacidad de la plataforma EliteHub',
})

import { ref, onMounted } from 'vue'
const content = ref({ page: 'privacity', title: '', subtitle: '', content: '', metadata: {} })

const { getContent } = useContent()

const handleContentUpdate = (updatedContent: any) => {
	content.value = updatedContent
}

onMounted(async () => {
	try {
		const data = await getContent('privacity')
		if (data) {
			content.value = {
				page: data.page || 'privacity',
				title: data.title || '',
				subtitle: data.subtitle || '',
				content: data.content || '',
				metadata: data.metadata || {},
			}
		}
	} catch (e) {
		// keep default empty content and avoid throwing
		console.error('Error loading privacy content', e)
	}
})
</script>
