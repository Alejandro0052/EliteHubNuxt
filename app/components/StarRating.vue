<template>
	<div class="flex text-yellow-500" :aria-label="ariaLabel">
		<span v-for="n in 5" :key="n" class="relative inline-block">
			<Icon name="fa6-regular:star" />
			<span class="absolute inset-0 overflow-hidden" :style="{ width: fillPercent(n) + '%' }">
				<Icon name="fa6-solid:star" />
			</span>
		</span>
	</div>
</template>

<script setup>
const props = defineProps({
	value: { type: Number, required: true },
})

function fillPercent(n) {
	const diff = props.value - (n - 1)
	if (diff >= 1) return 100
	if (diff <= 0) return 0
	return diff * 100
}

const ariaLabel = computed(() => {
	const v = Number.isInteger(props.value) ? props.value : props.value.toFixed(1)
	return `${v} de 5 estrellas`
})
</script>
