<template>
	<div class="mx-auto h-full max-w-[120rem] p-6">
		<div class="flex min-h-[600px] flex-col overflow-hidden rounded-lg lg:flex-row">
			<AuthBrandPanel class="min-h-48 w-full lg:w-2/5" />
			<div
				class="flex w-full flex-col items-center justify-center gap-4 bg-black px-4 py-10 lg:w-3/5">
				<h1 class="mb-2 font-display text-6xl leading-[0.9] font-extrabold text-white uppercase">Inicia sesión</h1>
				<form class="flex w-full max-w-md flex-col gap-4 px-4" @submit.prevent="handleLogin">
					<div class="text-white">
						<label for="email" class="sr-only">Usuario:</label>
						<input
							type="text"
							id="email"
							v-model="form.correo"
							placeholder="Correo"
							class="w-full border-0 border-b-2 border-neutral-500 bg-transparent text-white placeholder:text-neutral-400 focus:border-primary-dark focus:ring-0"
							required />
					</div>
					<div class="text-white">
						<label for="password" class="sr-only">Contraseña:</label>
						<input
							type="password"
							id="password"
							v-model="form.password"
							placeholder="Contraseña"
							class="w-full border-0 border-b-2 border-neutral-500 bg-transparent text-white placeholder:text-neutral-400 focus:border-primary-dark focus:ring-0"
							required />
					</div>
					<div class="flex items-center gap-2">
						<input
							type="checkbox"
							class="rounded-sm bg-neutral-600 text-white checked:border-green-600 checked:bg-green-600 focus:ring-0 disabled:pointer-events-none disabled:opacity-50"
							id="remember-me"
							v-model="form.remember"
							checked />
						<label for="remember-me" class="text-sm text-neutral-300">Recuérdame</label>
					</div>
					<div v-if="authStore.error" role="alert" class="text-center text-sm text-destructive-dark">
						{{ authStore.error }}
					</div>
					<button
						type="submit"
						:disabled="authStore.isLoading"
						class="button-primary block w-full px-5 py-2.5 text-center font-semibold focus:ring-2 focus:ring-white focus:outline-none">
						<span v-if="!authStore.isLoading"> Iniciar sesión </span>
						<div v-else class="flex items-center justify-center gap-4">
							<div class="animate-spin">
								<Icon name="fa6-solid:arrow-rotate-right"></Icon>
							</div>
							<span>Iniciando sesión...</span>
						</div>
					</button>
				</form>
				<span class="text-center text-sm text-white"
					>¿No tienes una cuenta?
					<NuxtLink to="/register" class="font-semibold text-primary-dark hover:underline"
						>Crea tu cuenta</NuxtLink
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
