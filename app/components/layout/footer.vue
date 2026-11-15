<template>
	<footer class="bg-black px-4 pt-10 pb-6 text-white sm:px-6 lg:px-8">
		<div class="mx-auto max-w-[120rem]">
			<div class="flex flex-col gap-8 border-b border-neutral-800 pb-8 md:flex-row md:items-end md:justify-between">
				<div>
					<p class="font-display text-6xl leading-[0.85] font-extrabold uppercase sm:text-7xl">Elite Hub</p>
					<p class="mt-3 max-w-[40ch] text-neutral-300">
						Deportistas, marcas, nutricionistas y patrocinadores en un mismo lugar.
					</p>
				</div>
				<nav aria-label="Información legal y contacto">
					<ul class="flex flex-col gap-x-8 gap-y-3 font-semibold sm:flex-row sm:flex-wrap">
						<li v-for="link in links" :key="link.to">
							<NuxtLink
								:to="link.to"
								class="text-neutral-200 underline-offset-4 hover:text-white hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white">
								{{ link.text }}
							</NuxtLink>
						</li>
					</ul>
				</nav>
			</div>
			<p class="pt-6 text-sm text-neutral-400">© {{ new Date().getFullYear() }} Elite Hub. Todos los derechos reservados.</p>
		</div>
	</footer>
</template>

<script lang="ts" setup>
const links = [
	{ to: "/aboutUs", text: "Quiénes somos" },
	{ to: "/privacity", text: "Política de privacidad" },
	{ to: "/terms", text: "Términos y condiciones" },
	{ to: "/contactUs", text: "Contacto" },
];
</script>
