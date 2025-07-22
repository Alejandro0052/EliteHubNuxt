<template>
	<nav class="border-white bg-black p-6 shadow-xl">
		<div class="mx-auto flex max-w-[120rem] items-center justify-between">
			<!-- Botón móvil -->
			<button
				type="button"
				@click="toggleMobileMenu"
				class="rounded-lg p-2 text-white hover:bg-gray-800 focus:outline-none md:hidden">
				<span class="sr-only">Abrir menú</span>
				<Icon :name="isMobileMenuOpen ? 'fa6-solid:xmark' : 'fa6-solid:bars'" class="h-6 w-6" />
			</button>

			<!-- Logo -->
			<NuxtLink to="/" class="flex items-center space-x-3 transition duration-300 hover:scale-110">
				<img src="/logo.jpeg" class="h-12" alt="Elite Hub Logo" />
			</NuxtLink>

			<!-- Menú principal -->
			<div class="hidden gap-2 md:flex lg:gap-6">
				<div v-for="link in menuLinks" :key="link.to">
					<NuxtLink
						:to="link.to"
						class="block rounded bg-transparent text-white transition duration-300 hover:scale-110"
						:class="{ 'font-bold': $route.path === link.to }">
						{{ link.text }}
					</NuxtLink>
				</div>
			</div>

			<!-- Controles de autenticación -->
			<div class="flex items-center">
				<!-- Mostrar spinner mientras se inicializa -->
				<div v-if="!authStore.isInitialized" class="px-4">
					<div class="h-6 w-6 animate-spin rounded-full border-2 border-t-white"></div>
				</div>

				<!-- Contenido una vez inicializado -->
				<template v-else>
					<!-- Usuario autenticado -->
					<div v-if="authStore.isAuthenticated" class="relative">
						<UserDropdown>
							<template #trigger>
								<button
									type="button"
									class="hover:bg-secondary flex items-center gap-2 rounded-full px-4 py-2 text-white transition duration-300">
									<!-- imagen de perfil -->
									<img
										v-if="authStore.user?.avatar"
										:src="authStore.user.avatar"
										class="h-10 w-10 rounded-full" />
									<div
										v-else
										class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white">
										{{ authStore.initials }}
									</div>
									<span class="hidden md:inline">{{ authStore.fullName }}</span>
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
						class="hover:bg-secondary rounded bg-transparent px-4 py-2 text-white transition duration-300 hover:scale-105">
						Iniciar sesión
					</NuxtLink>
				</template>
			</div>
		</div>

		<!-- Menú móvil -->
		<div
			v-if="isMobileMenuOpen"
			class="absolute right-0 left-0 z-50 mt-2 w-full bg-black p-4 shadow-lg md:hidden">
			<div class="space-y-2">
				<NuxtLink
					v-for="link in menuLinks"
					:key="link.to"
					:to="link.to"
					class="block rounded px-4 py-2 text-white hover:bg-gray-800"
					@click="closeMobileMenu"
					:class="{ 'bg-gray-800': $route.path === link.to }">
					{{ link.text }}
				</NuxtLink>
			</div>
		</div>
	</nav>
</template>

<script lang="ts" setup>
	const authStore = useAuthStore();
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
