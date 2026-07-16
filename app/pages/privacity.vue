<template>
	<div class="mx-auto max-w-4xl p-6">
		<div class="prose max-w-none text-gray-800 dark:text-gray-200">
			<h1 v-if="content.title">{{ content.title }}</h1>
			<h2 v-if="content.subtitle" class="text-lg text-gray-600 dark:text-gray-400">{{ content.subtitle }}</h2>

			<div v-if="content.content" v-html="content.content" />

			<div v-else class="py-6 text-gray-600 dark:text-gray-400">
				<p>La política de privacidad aún no ha sido publicada. Si usted es administrador puede editarla desde el panel de contenidos.</p>
			</div>
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

<style scoped>
/* Keep styling minimal to avoid affecting other pages */
.prose img { max-width: 100%; }
</style>
