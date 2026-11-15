<template>
	<div ref="dropdownRef" class="relative inline-block">
		<!-- Botón que abre/cierra el dropdown -->
		<div @click="toggle">
			<slot name="trigger" />
		</div>

		<!-- Contenido del dropdown -->
		<div
			v-if="visible"
			class="absolute right-0 z-50 mt-2 w-56 divide-y divide-border-hairline overflow-hidden rounded-lg border border-border-hairline bg-surface font-normal shadow-xl dark:divide-border-hairline-dark dark:border-border-hairline-dark dark:bg-surface-container-dark">
			<div v-if="(authStore.user as any)?.isAdmin" class="px-3 py-2 border-b bg-gray-50 text-xs text-gray-600 dark:border-gray-600 dark:bg-neutral-700 dark:text-gray-300">
				<strong class="text-sm text-gray-800 dark:text-white">Administrador</strong>
			</div>
			<ul class="px-2 py-2 text-on-surface dark:text-on-surface-dark" aria-labelledby="dropdownLargeButton">
				<li>
					<NuxtLink
						to="/profile"
						class="block w-full rounded px-3 py-2 hover:bg-surface-container-high dark:hover:bg-surface-container-high-dark"
						@click="toggle()">
						<Icon name="fa6-solid:user"></Icon>
						Perfil
					</NuxtLink>
				</li>
				<li>
					<NuxtLink
						to="/settings"
						class="block w-full rounded px-3 py-2 hover:bg-surface-container-high dark:hover:bg-surface-container-high-dark"
						@click="toggle()">
						<Icon name="fa6-solid:gear"></Icon>
						Ajustes
					</NuxtLink>
				</li>
				<li v-if="(authStore.user as any)?.isAdmin">
					<NuxtLink
						to="/admin/mensajes-contacto"
						class="block w-full rounded px-3 py-2 hover:bg-surface-container-high dark:hover:bg-surface-container-high-dark"
						@click="toggle()">
						<Icon name="fa6-solid:inbox"></Icon>
						Mensajes de contacto
					</NuxtLink>
				</li>
				<li v-if="(authStore.user as any)?.isAdmin">
					<NuxtLink
						to="/admin/reportes"
						class="block w-full rounded px-3 py-2 hover:bg-surface-container-high dark:hover:bg-surface-container-high-dark"
						@click="toggle()">
						<Icon name="fa6-solid:chart-pie"></Icon>
						Reportes e indicadores
					</NuxtLink>
				</li>
			</ul>
			<div class="px-2 py-2">
				<button
					@click="handleLogout()"
					class="flex w-full items-center gap-2 rounded px-3 py-2 text-left font-semibold text-destructive hover:bg-destructive hover:text-on-destructive dark:text-destructive-dark dark:hover:bg-destructive-dark dark:hover:text-on-destructive-dark">
					<Icon name="fa-solid:sign-out-alt" />
					Cerrar sesión
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { ref, onMounted, onBeforeUnmount } from 'vue'
	import { useAuthStore } from '~/stores/auth'

	const authStore = useAuthStore();

	const visible = ref(false)

	const dropdownRef = ref<HTMLElement | null>(null);

	onMounted(() => {
		document.addEventListener("click", handleClickOutside);
	});
	onBeforeUnmount(() => {
		document.removeEventListener("click", handleClickOutside);
	});

	function toggle() {
		visible.value = !visible.value;
	}

	function handleClickOutside(event: MouseEvent) {
		if (visible.value && dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
			visible.value = false;
		}
	}

	async function handleLogout() {
		await authStore.logout();
		toggle();
		await navigateTo("/login");
	}
</script>

<style></style>
