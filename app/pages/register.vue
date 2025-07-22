<template>
	<div class="mx-auto h-full max-w-[120rem] p-6">
		<div class="flex min-h-[600px] flex-col overflow-hidden rounded-xl shadow-xl lg:flex-row">
			<div class="h-48 w-full lg:h-auto lg:w-1/3">
				<img
					class="h-full w-full object-cover"
					src="/Jugador.jpeg"
					alt="Imagen jugador de futbol" />
			</div>
			<div
				class="flex w-full flex-col items-center justify-center gap-4 bg-black px-4 py-8 lg:w-2/3">
				<h2 class="text-4xl font-bold text-white">Elite Hub</h2>
				<p class="text-white">Registro</p>
				<form class="flex w-full max-w-md flex-col gap-4 px-4" @submit.prevent="handleSubmit">
					<div class="text-white">
						<label for="Nombre" class="sr-only">Nombre:</label>
						<input
							type="text"
							id="Nombre"
							v-model="form.nombre"
							placeholder="Nombre"
							class="w-full border-0 border-b-2 bg-transparent focus:border-white focus:ring-0"
							required />
					</div>
					<div class="text-white">
						<label for="Apellido" class="sr-only">Apellido:</label>
						<input
							type="text"
							id="Apellido"
							v-model="form.apellido"
							placeholder="Apellido"
							class="w-full border-0 border-b-2 bg-transparent focus:border-white focus:ring-0"
							required />
					</div>
					<div class="text-white">
						<label for="Correo" class="sr-only">Correo:</label>
						<input
							type="email"
							id="Correo"
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
					<div v-if="error || authStore.error" class="text-center text-sm text-red-500">
						{{ error || authStore.error }}
					</div>
					<button
						type="submit"
						:disabled="isLoading"
						class="block w-full rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-700/80 focus:ring-2 focus:ring-white focus:outline-none">
						<span v-if="!isLoading">Registrarte</span>
						<div v-else class="flex items-center justify-center gap-4">
							<div class="animate-spin">
								<Icon name="fa6-solid:arrow-rotate-right"></Icon>
							</div>
							<span>Registrando...</span>
						</div>
					</button>
				</form>
				<span class="text-center text-sm text-white"
					>¿Ya tienes una cuenta?
					<NuxtLink to="/login" class="font-semibold text-green-600 hover:underline"
						>Inicia sesión</NuxtLink
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

	const isLoading = ref(false);
	const form = reactive({
		nombre: "",
		apellido: "",
		correo: "",
		password: "",
	});

	const authStore = useAuthStore();
	const error = ref<string | null>(null);

	async function handleSubmit() {
		try {
			isLoading.value = true;
			error.value = null;

			const success = await authStore.register({
				nombre: form.nombre,
				apellido: form.apellido,
				correo: form.correo,
				password: form.password,
			});

			if (success) {
				await navigateTo("/");
			} else {
				error.value = authStore.error || "Error durante el registro";
			}
		} catch (error: any) {
			console.error("Error en el registro:", error);
			error.value = "Ocurrió un error durante el registro. Por favor intenta nuevamente.";
		} finally {
			isLoading.value = false;
		}
	}
</script>
