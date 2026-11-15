<template>
	<!-- Panel de marca de login y registro: el nombre en grande sobre el verde de la marca, igual en ambos temas -->
	<div class="flex flex-col justify-end bg-primary p-8 text-on-primary lg:p-12">
		<p class="font-display text-7xl leading-[0.85] font-extrabold uppercase lg:text-8xl xl:text-9xl">Elite Hub</p>
		<p class="mt-4 max-w-[34ch] text-lg">
			<slot>Deportistas, marcas, nutricionistas y patrocinadores en un mismo lugar.</slot>
		</p>
	</div>
</template>
