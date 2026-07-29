<template>
	<NuxtLink
		:to="`/catalogo/${item.id}`"
		class="block overflow-hidden rounded-xl bg-white shadow-lg transition-transform duration-300 hover:scale-105 dark:bg-neutral-800">
		<img
			v-if="item.imagenes?.[0]"
			:src="item.imagenes[0]"
			class="h-40 w-full cursor-zoom-in object-cover"
			@click.stop.prevent="showLightbox = true" />
		<div v-else class="flex h-40 w-full items-center justify-center bg-gray-100 text-gray-400 dark:bg-neutral-700">
			<Icon name="fa6-solid:image" class="text-3xl" />
		</div>

		<div class="p-4">
			<h3 class="mb-1 text-lg font-semibold text-gray-900 dark:text-white">{{ item.nombre }}</h3>
			<p class="mb-2 text-sm text-gray-600 dark:text-gray-300">{{ item.usuario?.nombre }} {{ item.usuario?.apellido }}</p>
			<div class="flex items-center gap-2">
				<span class="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
					{{ item.tipoItem === "SERVICIO" ? "Servicio" : "Físico" }}
				</span>
				<span v-if="item.categoria" class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-neutral-700 dark:text-gray-200">
					{{ item.categoria.nombre }}
				</span>
			</div>
		</div>
	</NuxtLink>

	<Teleport to="body">
		<div
			v-if="showLightbox"
			class="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
			@click="showLightbox = false">
			<button
				type="button"
				class="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg"
				@click.stop="showLightbox = false">
				<Icon name="fa6-solid:xmark" />
			</button>
			<img :src="item.imagenes?.[0]" class="max-h-[80vh] max-w-full rounded-lg object-contain" @click.stop />
		</div>
	</Teleport>
</template>

<script setup>
defineProps({
	item: { type: Object, required: true },
});

const showLightbox = ref(false);
</script>
