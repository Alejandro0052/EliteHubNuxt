<template>
	<header
		class="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b-2 border-on-surface pb-5 dark:border-on-surface-dark">
		<div>
			<h1
				class="font-display text-6xl leading-[0.9] font-extrabold text-on-surface uppercase sm:text-7xl md:text-8xl lg:text-9xl dark:text-on-surface-dark">
				{{ title }}
			</h1>
			<p v-if="subtitle" class="mt-3 max-w-[46ch] text-lg text-on-surface-variant dark:text-on-surface-variant-dark">
				{{ subtitle }}
			</p>
		</div>
		<!-- Acción principal de la página (por ejemplo, crear) -->
		<slot name="action" />
	</header>
</template>

<script setup>
// Encabezado común de los listados (dirección visual "La planilla").
defineProps({
	title: { type: String, required: true },
	subtitle: { type: String, default: "" },
});
</script>
