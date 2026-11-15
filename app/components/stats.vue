<template>
	<div class="card-lift relative px-5 pt-4 pb-5 rounded-lg border border-border-hairline bg-surface dark:border-border-hairline-dark dark:bg-surface-container-dark">
		<div class="flex items-baseline font-display text-7xl leading-[0.9] font-extrabold tabular-nums text-on-surface dark:text-on-surface-dark">
			<count-up :start-val="startValue" :end-val="endValue" :duration="duration"></count-up>
		</div>
		<span class="mt-1 block text-on-surface-variant dark:text-on-surface-variant-dark">{{ text }}</span>
		<Icon v-if="icon" :name="icon" aria-hidden="true" class="absolute top-4 right-4 text-xl text-primary dark:text-primary-dark" />
	</div>
</template>

<script lang="ts" setup>
	import CountUp from "vue-countup-v3";

	defineProps({
		startValue: { type: Number, default: 0 },
		endValue: { type: Number, required: true },
		duration: { type: Number, default: 2 },
		text: String,
		icon: String,
	});
</script>

<style></style>
