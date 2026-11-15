<template>
	<nav aria-label="Principal" class="relative bg-black px-4 py-3 sm:px-6 lg:px-8">
		<div class="mx-auto flex max-w-[120rem] items-center justify-between">
			<!-- Botón móvil -->
			<button
				type="button"
				:aria-expanded="isMobileMenuOpen"
				@click="toggleMobileMenu"
				class="rounded-lg p-2 text-white hover:bg-neutral-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white md:hidden">
				<span class="sr-only">{{ isMobileMenuOpen ? "Cerrar menú" : "Abrir menú" }}</span>
				<Icon :name="isMobileMenuOpen ? 'fa6-solid:xmark' : 'fa6-solid:bars'" class="h-6 w-6" />
			</button>

			<!-- Logo -->
			<NuxtLink to="/" class="flex items-center rounded transition duration-300 hover:scale-110 motion-reduce:transition-none motion-reduce:hover:transform-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white">
				<img src="/logo.jpeg" class="h-11" alt="Elite Hub, inicio" />
			</NuxtLink>

			<!-- Menú principal -->
			<div class="hidden gap-5 md:flex lg:gap-9">
				<NuxtLink
					v-for="link in menuLinks"
					:key="link.to"
					:to="link.to"
					:aria-current="isActive(link.to) ? 'page' : undefined"
					class="border-b-4 pt-2 pb-1 font-display text-[1.75rem] leading-none font-extrabold tracking-wide uppercase transition duration-200 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:transform-none focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-white"
					:class="isActive(link.to) ? 'border-primary-dark text-white' : 'border-transparent text-neutral-400 hover:border-neutral-600 hover:text-white'">
					{{ link.text }}
				</NuxtLink>
			</div>

			<!-- Controles de autenticación -->
			<div class="flex items-center">
				<!-- Mostrar spinner mientras se inicializa -->
				<div v-if="!isInitialized" class="px-4">
					<div class="h-6 w-6 animate-spin rounded-full border-2 border-t-white"></div>
				</div>

				<!-- Contenido una vez inicializado -->
				<template v-else>
					<!-- Usuario autenticado -->
					<div v-if="isAuthenticated" class="relative">
						<UserDropdown>
							<template #trigger>
								<button
									type="button"
									class="flex items-center gap-2 rounded-full py-1 pr-3 pl-1 font-semibold text-white transition-colors hover:bg-neutral-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white">
									<!-- imagen de perfil -->
									<img
										v-if="user?.avatar"
										:src="user.avatar"
										alt=""
										class="h-10 w-10 rounded-full object-cover" />
									<div
										v-else
										class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-dark font-display text-xl font-extrabold text-black">
										{{ initials }}
									</div>
									<span class="hidden md:inline">{{ fullName }}</span>
									<Icon name="fa6-solid:angle-down" />
								</button>
							</template>

							<template #content>
								<NuxtLink
									to="/perfil"
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
									@click="closeMobileMenu">
									<Icon name="solar:user-linear" class="mr-2" />
									Perfil
								</NuxtLink>
								<button
									type="button"
									@click="handleLogout"
									class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100">
									<Icon name="solar:logout-2-linear" class="mr-2" />
									Cerrar sesión
								</button>
							</template>
						</UserDropdown>
					</div>

					<!-- Usuario no autenticado -->
					<NuxtLink
						v-else
						to="/login"
						class="rounded-full border border-white px-4 py-2 font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-black motion-reduce:transition-none motion-reduce:hover:transform-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white">
						Iniciar sesión
					</NuxtLink>
				</template>
			</div>
		</div>

		<!-- Menú móvil -->
		<div
			v-if="isMobileMenuOpen"
			class="absolute top-full right-0 left-0 z-50 w-full border-t border-neutral-800 bg-black p-4 md:hidden">
			<div class="space-y-1">
				<NuxtLink
					v-for="link in menuLinks"
					:key="link.to"
					:to="link.to"
					:aria-current="isActive(link.to) ? 'page' : undefined"
					class="block border-l-4 px-4 py-2.5 font-display text-3xl leading-none font-extrabold tracking-wide uppercase hover:text-white"
					:class="isActive(link.to) ? 'border-primary-dark text-white' : 'border-transparent text-neutral-400'"
					@click="closeMobileMenu">
					{{ link.text }}
				</NuxtLink>
			</div>
		</div>
	</nav>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
const authStore = useAuthStore();
const { user, fullName, initials, isAuthenticated, isInitialized } = storeToRefs(authStore);
const route = useRoute();
const isMobileMenuOpen = ref(false);

	// Cerrar menú móvil al cambiar de ruta
	watch(
		() => route.path,
		() => {
			closeMobileMenu();
		}
	);

	const menuLinks = [
		{ to: "/", text: "Inicio" },
		{ to: "/patrocinadores", text: "Patrocinadores" },
		{ to: "/deportistas", text: "Deportistas" },
		{ to: "/marcas", text: "Marcas" },
		{ to: "/nutricionistas", text: "Nutricionistas" },
	];

	// Una seccion queda activa tambien en sus paginas internas (p. ej. /deportistas/12).
	function isActive(to: string) {
		return to === "/" ? route.path === "/" : route.path === to || route.path.startsWith(to + "/");
	}

	function toggleMobileMenu() {
		isMobileMenuOpen.value = !isMobileMenuOpen.value;
	}

	function closeMobileMenu() {
		isMobileMenuOpen.value = false;
	}

	async function handleLogout() {
		await authStore.logout();
		closeMobileMenu();
		navigateTo("/");
	}
</script>
