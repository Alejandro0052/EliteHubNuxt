<template>
	<NuxtLink
		:to="`/catalogo/${item.id}`"
		class="card-lift group block overflow-hidden rounded-lg border border-border-hairline bg-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:border-border-hairline-dark dark:bg-surface-container-dark dark:focus-visible:outline-primary-dark">
		<!-- Misma ficha que los directorios: imagen a sangre sobre negro en ambos temas. -->
		<div class="relative flex aspect-[4/5] items-center justify-center bg-black text-white">
			<img
				v-if="item.imagenes?.[0]"
				:src="item.imagenes[0]"
				:alt="item.nombre"
				class="absolute inset-0 h-full w-full object-cover" />
			<Icon v-else name="fa6-solid:image" aria-hidden="true" class="text-5xl opacity-40" />

			<span class="absolute top-3 left-4 rounded-sm bg-white px-2 py-0.5 text-[0.8125rem] font-semibold text-black">
				{{ item.tipoItem === "SERVICIO" ? "Servicio" : "Producto" }}
			</span>

			<button
				v-if="item.imagenes?.[0]"
				type="button"
				aria-label="Ampliar imagen"
				class="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
				@click.stop.prevent="showLightbox = true">
				<Icon name="fa6-solid:magnifying-glass-plus" />
			</button>
		</div>

		<div
			class="border-t-4 border-transparent px-4 pt-3.5 pb-4 transition-colors duration-150 group-hover:border-primary group-focus-visible:border-primary motion-reduce:transition-none dark:group-hover:border-primary-dark dark:group-focus-visible:border-primary-dark">
			<h3 class="font-display text-[1.75rem] leading-[0.95] font-extrabold text-on-surface uppercase dark:text-on-surface-dark">
				{{ item.nombre }}
			</h3>
			<p v-if="item.usuario" class="mt-1.5 truncate font-semibold text-primary dark:text-primary-dark">
				{{ item.usuario.nombre }} {{ item.usuario.apellido }}
			</p>
			<p v-if="item.categoria" class="mt-1 truncate text-sm text-on-surface-variant dark:text-on-surface-variant-dark">
				{{ item.categoria.nombre }}
			</p>
		</div>
	</NuxtLink>

	<Teleport to="body">
		<div
			v-if="showLightbox"
			class="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
			@click="showLightbox = false">
			<button
				type="button"
				aria-label="Cerrar imagen"
				class="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg"
				@click.stop="showLightbox = false">
				<Icon name="fa6-solid:xmark" />
			</button>
			<img :src="item.imagenes?.[0]" :alt="item.nombre" class="max-h-[80vh] max-w-full rounded-lg object-contain" @click.stop />
		</div>
	</Teleport>
</template>

<script setup>
defineProps({
	item: { type: Object, required: true },
});

const showLightbox = ref(false);
</script>
