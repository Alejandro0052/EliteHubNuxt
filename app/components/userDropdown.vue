<template>
	<div ref="dropdownRef" class="relative inline-block">
		<!-- Botón que abre/cierra el dropdown -->
		<div @click="toggle">
			<slot name="trigger" />
		</div>

		<!-- Contenido del dropdown -->
		<div
			v-if="visible"
			class="absolute right-0 z-50 mt-2 w-44 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white font-normal shadow-xl">
			<ul class="px-2 py-2 text-sm text-gray-700" aria-labelledby="dropdownLargeButton">
				<li>
					<NuxtLink
						to="/profile"
						class="block w-full rounded px-4 py-2 hover:bg-gray-300"
						@click="toggle()">
						<Icon name="fa6-solid:user"></Icon>
						Perfil
					</NuxtLink>
				</li>
				<li>
					<NuxtLink
						to="/settings"
						class="block w-full rounded px-4 py-2 font-semibold hover:bg-gray-300"
						@click="toggle()">
						<Icon name="fa6-solid:gear"></Icon>
						Ajustes
					</NuxtLink>
				</li>
			</ul>
			<div class="px-2 py-2">
				<button
					@click="handleLogout()"
					class="flex w-full items-center gap-2 rounded px-4 py-2 text-left text-sm font-semibold text-gray-700 hover:bg-red-500 hover:text-white">
					<Icon name="fa-solid:sign-out-alt" />
					Cerrar sesión
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	const authStore = useAuthStore();

	const visible = defineModel<boolean>("visible", { default: false });

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
