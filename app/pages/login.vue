<template>
	<div class="mx-auto h-full max-w-[120rem] p-6">
		<div class="flex min-h-[600px] flex-col overflow-hidden rounded-xl shadow-xl lg:flex-row">
			<!-- Panel de marca (reemplaza la foto de stock Jugador.jpeg) -->
			<div class="flex h-48 w-full items-center justify-center bg-primary p-8 lg:h-auto lg:w-1/3">
				<div class="max-w-xs text-center">
					<div
						class="mx-auto mb-6 flex h-19 w-19 items-center justify-center rounded-full bg-black text-2xl font-bold text-white">
						EH
					</div>
					<p class="text-sm leading-relaxed text-on-primary">
						Conecta. Entrena. Crece. Tu comunidad deportiva te espera.
					</p>
				</div>
			</div>
			<div
				class="flex w-full flex-col items-center justify-center gap-4 bg-black px-4 py-8 lg:w-2/3">
				<h2 class="text-4xl font-bold text-white">Elite Hub</h2>
				<p class="text-white">Inicia sesión</p>
				<form class="flex w-full max-w-md flex-col gap-4 px-4" @submit.prevent="handleLogin">
					<div class="text-white">
						<label for="email" class="sr-only">Usuario:</label>
						<input
							type="text"
							id="email"
							v-model="form.correo"
							placeholder="Correo"
							class="w-full border-0 border-b-2 bg-transparent focus:border-white focus:ring-0"
							required />
					</div>
					<div class="text-white">
						<label for="password" class="sr-only">Contraseña:</label>
						<input
							type="password"
							id="password"
							v-model="form.password"
							placeholder="Contraseña"
							class="w-full border-0 border-b-2 bg-transparent focus:border-white focus:ring-0"
							required />
					</div>
					<div class="flex items-center gap-2">
						<input
							type="checkbox"
							class="rounded-sm bg-neutral-600 text-white checked:border-green-600 checked:bg-green-600 focus:ring-0 disabled:pointer-events-none disabled:opacity-50"
							id="remember-me"
							v-model="form.remember"
							checked />
						<label for="remember-me" class="text-sm text-gray-400">Recuérdame</label>
					</div>
					<div v-if="authStore.error" class="text-center text-sm text-red-500">
						{{ authStore.error }}
					</div>
					<button
						type="submit"
						:disabled="authStore.isLoading"
						class="button-primary block w-full px-5 py-2.5 text-center text-sm font-medium focus:ring-2 focus:ring-white focus:outline-none">
						<span v-if="!authStore.isLoading"> Iniciar sesión </span>
						<div v-else class="flex items-center justify-center gap-4">
							<div class="animate-spin">
								<Icon name="fa6-solid:arrow-rotate-right"></Icon>
							</div>
							<span>Iniciando sesión...</span>
						</div>
					</button>
				</form>
				<NuxtLink to="/" class="text-center text-sm text-green-600 hover:underline"
					>Recuperar contraseña
				</NuxtLink>
				<span class="text-center text-sm text-white"
					>¿No tienes una cuenta?
					<NuxtLink to="/register" class="font-semibold text-green-600 hover:underline"
						>Regístrate ahora mismo</NuxtLink
					></span
				>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	definePageMeta({
		auth: {
			unauthenticatedOnly: true,
			navigateUnauthenticatedTo: "/",
		},
	});

	const authStore = useAuthStore();

	onMounted(async () => {
		await authStore.checkAuth();
		// Solo redirige si está autenticado y no hay error
		if (authStore.isAuthenticated === true && !authStore.error) {
			await navigateTo("/");
		}
	});

	const form = reactive({
		correo: "",
		password: "",
		remember: true,
	});

	async function handleLogin() {
		const success = await authStore.login({
			correo: form.correo,
			password: form.password,
		});

		if (success) {
			await navigateTo("/");
		}
	}
</script>
