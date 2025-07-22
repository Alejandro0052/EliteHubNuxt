<template>
	<footer class="border-t border-t-white bg-black shadow-xl">
		<div class="mx-auto flex w-full flex-col items-center gap-4 p-4">
			<img class="h-16" src="/logo.jpeg" alt="Elite Hub Logo" />
			<div class="sm:flex sm:items-center sm:justify-between">
				<ul class="mx-auto flex w-full max-w-screen-lg justify-around gap-6 text-gray-200">
					<li>
						<NuxtLink to="/aboutUs" class="hover:underline">¿Quienes somos?</NuxtLink>
					</li>
					<li>
						<NuxtLink to="/privacity" class="hover:underline">Políticas de privacidad</NuxtLink>
					</li>
					<li>
						<NuxtLink to="/terms" class="hover:underline">Términos y condiciones</NuxtLink>
					</li>
					<li>
						<NuxtLink to="/contactUs" class="hover:underline">Contáctenos</NuxtLink>
					</li>
				</ul>
			</div>
			<span class="block text-center text-sm text-gray-600"
				>© {{ new Date().getFullYear() }} Elite Hub. Todos los derechos reservados.</span
			>
		</div>
	</footer>
</template>

<script lang="ts" setup></script>

<style></style>
