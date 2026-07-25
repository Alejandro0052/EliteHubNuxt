<template>
	<div class="mx-auto min-h-screen py-10">
		<ContentEditor page="privacity" :initial-content="content" @updated="handleContentUpdate" />

		<!-- Hero Section -->
		<section class="relative bg-black px-4 py-16 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-4xl text-center">
				<h1 class="mb-6 text-4xl font-bold text-white md:text-5xl">
					{{ content.title || "Política de Privacidad" }}
				</h1>
				<p class="mb-8 text-lg text-gray-300 md:text-xl">
					{{ content.subtitle || "Última actualización: Enero 2024" }}
				</p>
			</div>
		</section>

		<!-- Main Content -->
		<section class="px-4 py-16 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-4xl rounded-xl bg-white p-8 text-gray-800 shadow-lg md:p-12">
				<div v-if="content.content" class="prose max-w-none" v-html="content.content" />

				<div v-else class="py-6 text-gray-600">
					<p>La política de privacidad aún no ha sido publicada. Si usted es administrador puede editarla desde el panel de contenidos.</p>
				</div>
			</div>
		</section>
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

<style scoped>
/* Keep styling minimal to avoid affecting other pages */
.prose img { max-width: 100%; }
</style>
