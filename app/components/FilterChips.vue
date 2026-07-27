<template>
	<div class="flex flex-wrap gap-2 overflow-x-auto">
		<button
			v-for="option in options"
			:key="option.value ?? 'null'"
			type="button"
			class="rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors"
			:class="
				modelValue === option.value
					? 'bg-black text-white'
					: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
			"
			@click="toggle(option.value)">
			{{ option.label }}
		</button>
	</div>
</template>

<script setup>
const props = defineProps({
	options: { type: Array, required: true },
	modelValue: { type: [String, Number, null], default: null },
});

const emit = defineEmits(["update:modelValue"]);

function toggle(value) {
	emit("update:modelValue", props.modelValue === value ? null : value);
}
</script>
