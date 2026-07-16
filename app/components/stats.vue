<template>
	<div class="relative flex flex-col items-center justify-center gap-4 rounded-2xl bg-white p-6">
		<div class="flex items-center justify-end text-6xl font-semibold">
			<count-up :start-val="startValue" :end-val="endValue" :duration="duration"></count-up>
			<span>+</span>
		</div>
		<span class="text text-gray-600">{{ text }}</span>
		<div
			v-if="icon"
			class="absolute top-1 right-1 flex items-center justify-center rounded-full bg-black p-2 text-white">
			<Icon :name="icon" />
		</div>
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
