<template>
	<div class="flex flex-wrap gap-2 overflow-x-auto">
		<button
			v-for="option in options"
			:key="option.value ?? 'null'"
			type="button"
			class="rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors"
			:class="
				isSelected(option.value)
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
	modelValue: { type: [String, Number, Array, null], default: null },
	multiple: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

function isSelected(value) {
	return props.multiple
		? Array.isArray(props.modelValue) && props.modelValue.includes(value)
		: props.modelValue === value;
}

function toggle(value) {
	if (!props.multiple) {
		emit("update:modelValue", props.modelValue === value ? null : value);
		return;
	}
	const current = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
	const idx = current.indexOf(value);
	if (idx === -1) current.push(value);
	else current.splice(idx, 1);
	emit("update:modelValue", current);
}
</script>
