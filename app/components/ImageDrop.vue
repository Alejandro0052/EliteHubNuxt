<template>
	<div>
		<!-- El input nativo cubre toda la zona: así funcionan el clic, el teclado y arrastrar y soltar sin código extra -->
		<div
			class="form-drop"
			:class="{ 'form-drop-active': dragging }"
			@dragenter="dragging = true"
			@dragleave="dragging = false"
			@drop="dragging = false">
			<Icon name="fa6-solid:image" aria-hidden="true" class="text-3xl text-on-surface-variant dark:text-on-surface-variant-dark" />
			<p class="text-on-surface dark:text-on-surface-dark">
				<span class="font-semibold text-primary dark:text-primary-dark">{{ multiple ? "Elige las imágenes" : "Elige una imagen" }}</span>
				o arrástrala hasta aquí
			</p>
			<p v-if="hint" class="form-hint">{{ hint }}</p>
			<input
				:id="id"
				ref="inputEl"
				type="file"
				:accept="accept"
				:multiple="multiple"
				:required="required"
				class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
				@change="onChange" />
		</div>

		<div v-if="previews.length" class="mt-4">
			<div class="mb-2 flex items-center justify-between gap-3">
				<p class="form-label">{{ previews.length === 1 ? "Imagen elegida" : `${previews.length} imágenes elegidas` }}</p>
				<button
					type="button"
					class="rounded text-sm font-semibold text-destructive underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-current dark:text-destructive-dark"
					@click="clear">
					Quitar
				</button>
			</div>
			<ul class="grid grid-cols-3 gap-3 sm:grid-cols-4">
				<li v-for="p in previews" :key="p.url">
					<img :src="p.url" alt="" class="aspect-square w-full rounded-md bg-black object-cover" />
					<p class="form-hint mt-1 truncate">{{ p.name }}</p>
				</li>
			</ul>
		</div>

		<div v-else-if="currentList.length" class="mt-4">
			<p class="form-label mb-2">{{ currentList.length === 1 ? "Imagen actual" : "Imágenes actuales" }}</p>
			<ul class="grid grid-cols-3 gap-3 sm:grid-cols-4">
				<li v-for="src in currentList" :key="src">
					<img :src="src" alt="" class="aspect-square w-full rounded-md bg-black object-cover" />
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup>
// Selector de imágenes de los formularios: zona para arrastrar, vista previa de lo elegido
// y, al editar, las imágenes que ya tiene el registro.
const props = defineProps({
	id: { type: String, default: undefined },
	accept: { type: String, default: "image/*" },
	multiple: { type: Boolean, default: false },
	required: { type: Boolean, default: false },
	hint: { type: String, default: "" },
	// Imagen o imágenes ya guardadas (URL o lista de URL)
	current: { type: [String, Array], default: () => [] },
});

const inputEl = ref(null);
const dragging = ref(false);
const previews = ref([]);

const currentList = computed(() => (Array.isArray(props.current) ? props.current : props.current ? [props.current] : []).filter(Boolean));

function releasePreviews() {
	previews.value.forEach((p) => URL.revokeObjectURL(p.url));
	previews.value = [];
}

function onChange() {
	releasePreviews();
	previews.value = Array.from(inputEl.value?.files || []).map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
}

function clear() {
	if (inputEl.value) inputEl.value.value = "";
	releasePreviews();
}

onBeforeUnmount(releasePreviews);

// Las páginas leen `ref.value.files` igual que con un <input type="file"> nativo.
defineExpose({
	get files() {
		return inputEl.value?.files ?? null;
	},
	clear,
});
</script>
