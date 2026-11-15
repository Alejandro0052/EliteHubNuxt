<template>
	<div :class="variant === 'tabs' ? 'flex gap-6 overflow-x-auto' : 'flex flex-wrap gap-2 overflow-x-auto'">
		<button
			v-for="option in options"
			:key="option.value ?? 'null'"
			type="button"
			:aria-pressed="isSelected(option.value)"
			class="whitespace-nowrap transition-colors focus-visible:outline-3 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark"
			:class="[variant === 'tabs' ? TABS.base : CHIPS.base, (variant === 'tabs' ? TABS : CHIPS)[isSelected(option.value) ? 'on' : 'off']]"
			@click="toggle(option.value)">
			{{ option.label }}
		</button>
	</div>
</template>

<script setup>
const CHIPS = {
	base: "rounded-full px-4 py-2 text-sm font-medium focus-visible:outline-offset-2",
	on: "bg-black text-white dark:bg-white dark:text-black",
	off: "bg-surface-container-high text-on-surface hover:bg-gray-200 dark:bg-surface-container-high-dark dark:text-on-surface-dark dark:hover:bg-neutral-700",
};

// Pestañas con subrayado: para filtrar un listado (una sola opción activa a la vez).
const TABS = {
	base: "border-b-4 pb-2 font-semibold focus-visible:-outline-offset-2",
	on: "border-primary text-on-surface dark:border-primary-dark dark:text-on-surface-dark",
	off: "border-transparent text-on-surface-variant hover:text-on-surface dark:text-on-surface-variant-dark dark:hover:text-on-surface-dark",
};

const props = defineProps({
	variant: { type: String, default: "chips" },
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
