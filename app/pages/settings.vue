<template>
	<div class="mx-auto w-full max-w-[120rem] px-4 py-6">
		<div class="rounded-lg bg-white p-6 shadow-md">
			<h1 class="mb-6 text-2xl font-bold text-gray-800">Configuración de Perfil</h1>

			<form @submit.prevent="updateProfile" class="space-y-6">
				<!-- Sección de Información Básica -->
				<div class="rounded-lg bg-gray-50 p-6">
					<h2 class="mb-4 text-lg font-semibold text-gray-700">Información Básica</h2>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label for="firstName" class="block text-sm font-medium text-gray-700">Nombre</label>
							<input
								id="firstName"
								v-model="form.firstName"
								type="text"
								required
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-black focus:outline-none" />
						</div>

						<div>
							<label for="lastName" class="block text-sm font-medium text-gray-700">Apellido</label>
							<input
								id="lastName"
								v-model="form.lastName"
								type="text"
								required
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-black focus:outline-none" />
						</div>

						<div class="flex flex-col items-start gap-2 md:col-span-2">
							<label for="avatarFile" class="block text-sm font-medium text-gray-700">
								Subir Avatar
							</label>
							<div class="flex items-center gap-4">
								<img
									v-if="avatarPreview"
									:src="avatarPreview"
									alt="Imagen de perfil"
									class="h-16 w-16 rounded-full border object-cover" />
								<span
									v-else
									class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-400">
									<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5.121 17.804A13.937 13.937 0 0112 15c2.21 0 4.304.534 6.121 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
								</span>
								<input
									id="avatarFile"
									type="file"
									accept="image/*"
									@change="handleAvatarUpload"
									class="block file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100" />
							</div>
							<p v-if="avatarError" class="text-xs text-red-500">{{ avatarError }}</p>
						</div>
					</div>
				</div>

				<!-- Sección de Información Adicional -->
				<div class="rounded-lg bg-gray-50 p-6">
					<h2 class="mb-4 text-lg font-semibold text-gray-700">Información Adicional</h2>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label for="profession" class="block text-sm font-medium text-gray-700"
								>Profesión</label
							>
							<input
								id="profession"
								v-model="form.information.profession"
								type="text"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-black focus:outline-none" />
						</div>

						<div>
							<label for="specialty" class="block text-sm font-medium text-gray-700"
								>Especialidad</label
							>
							<input
								id="specialty"
								v-model="form.information.specialty"
								type="text"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-black focus:outline-none" />
						</div>

						<div>
							<label for="phone" class="block text-sm font-medium text-gray-700">Teléfono</label>
							<input
								id="phone"
								v-model="form.information.phone"
								type="tel"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-black focus:outline-none" />
						</div>

						<div>
							<label for="gender" class="block text-sm font-medium text-gray-700">Género</label>
							<select
								id="gender"
								v-model="form.information.gender"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-black focus:outline-none">
								<option value="">Selecciona una opción</option>
								<option value="masculino">Masculino</option>
								<option value="femenino">Femenino</option>
								<option value="otro">Otro</option>
								<option value="prefiero-no-decir">Prefiero no decir</option>
							</select>
						</div>

						<div>
							<label for="birthDate" class="block text-sm font-medium text-gray-700"
								>Fecha de Nacimiento</label
							>
							<input
								id="birthDate"
								v-model="form.information.birthDate"
								type="date"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-black focus:outline-none" />
						</div>
					</div>

					<div class="mt-4">
						<label for="experience" class="block text-sm font-medium text-gray-700"
							>Experiencia</label
						>
						<textarea
							id="experience"
							v-model="form.information.experience"
							rows="4"
							class="mt-1 block min-h-[100px] w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-black focus:outline-none"
							placeholder="Cuéntanos sobre tu experiencia..."></textarea>
					</div>
				</div>

				<!-- Botones de acción -->
				<div class="flex justify-end space-x-4">
					<button
						type="button"
						@click="resetForm"
						class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
						Cancelar
					</button>
					<button
						type="submit"
						:disabled="isLoading"
						class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50">
						<span v-if="!isLoading">Guardar Cambios</span>
						<div v-else class="h-6 w-6 animate-spin rounded-full border-2 border-t-white"></div>
						<span v-if="isLoading">Guardando...</span>
					</button>
				</div>
			</form>

			<!-- Mensaje de éxito -->
			<div
				v-if="successMessage"
				class="mt-4 rounded border border-green-400 bg-green-100 p-4 text-green-700">
				{{ successMessage }}
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	const authStore = useAuthStore();
	const isLoading = ref(false);
	const successMessage = ref("");
	const avatarFile = ref<File | null>(null);
	const avatarPreview = ref<string | null>(null);
	const avatarError = ref<string | null>(null);

	// Inicializar el formulario con valores por defecto
	const form = ref<any>({
		firstName: "",
		lastName: "",
		avatar: "",
		avatarFile: null,
		information: {
			profession: null,
			specialty: null,
			phone: null,
			gender: null,
			birthDate: null,
			experience: null,
		},
	});

	const handleAvatarUpload = (event: Event) => {
		avatarError.value = null;
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file = target.files[0];
			// Validar tipo y tamaño
			if (!file.type.startsWith("image/")) {
				avatarError.value = "Solo se permiten imágenes.";
				return;
			}
			if (file.size > 2 * 1024 * 1024) {
				// 2 MB
				avatarError.value = "La imagen no debe superar los 2MB.";
				return;
			}
			form.value.avatarFile = file;
			avatarFile.value = file;
			avatarPreview.value = URL.createObjectURL(file);
		}
	};

	const loadUserData = async () => {
		try {
			await authStore.checkAuth();

			if (!authStore.isAuthenticated || !authStore.user) {
				console.error("Usuario no autenticado");
				navigateTo("/login");
				return;
			}

			const user = await $fetch(`/api/profile`, {
				headers: useRequestHeaders(["cookie"]),
			});

			if (!user) {
				console.error("No se pudo cargar la información del usuario");
				return;
			}

			form.value = {
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				avatar: user.avatar || "",
				avatarFile: null,
				information: {
					profession: user.information?.profession || null,
					specialty: user.information?.specialty || null,
					phone: user.information?.phone || null,
					gender: user.information?.gender || null,
					birthDate: user.information?.birthDate,
					experience: user.information?.experience || null,
				},
			};

			if (user.avatar) {
				avatarPreview.value = user.avatar;
			}
		} catch (error) {
			console.error("Error al cargar los datos del usuario:", error);
		}
	};

	// Cargar los datos del usuario al montar el componente
	onMounted(() => {
		loadUserData();
	});

	// Función para actualizar el perfil
	const updateProfile = async () => {
		try {
			isLoading.value = true;
			successMessage.value = "";

			const formData = new FormData();
			formData.append("firstName", form.value.firstName);
			formData.append("lastName", form.value.lastName);

			form.value.information.birthDate = form.value.information.birthDate
				? new Date(form.value.information.birthDate).toISOString()
				: null;

			// Agrega campos anidados como information
			Object.entries(form.value.information).forEach(([key, value]) => {
				if (value !== null) {
					formData.append(`information.${key}`, value as string);
				}
			});

			if (avatarFile.value) {
				formData.append("avatarFile", avatarFile.value);
			}

			// Enviar la solicitud al servidor
			const response = await $fetch("/api/profile", {
				method: "PUT",
				body: formData,
			});

			// Actualizar el store con los nuevos datos
			if (response.user) {
				// Actualizar el usuario en el store
				authStore.updateUser({
					firstName: response.user.firstName,
					lastName: response.user.lastName,
					avatar: response.user.avatar,
					information: response.user.information,
				});

				// Actualizar el formulario con los nuevos datos
				form.value.avatar = response.user.avatar || "";
				if (response.user.avatar) {
					avatarPreview.value = response.user.avatar;
				}

				// Limpiar el archivo temporal
				form.value.avatarFile = null;
				avatarFile.value = null;

				successMessage.value = "¡Perfil actualizado correctamente!";
				setTimeout(() => {
					successMessage.value = "";
				}, 5000);
			}
		} catch (error) {
			console.error("Error al actualizar el perfil:", error);
		} finally {
			isLoading.value = false;
		}
	};

	// Función para reiniciar el formulario a los valores actuales del usuario
	const resetForm = () => {
		if (authStore.user) {
			form.value.firstName = authStore.user.firstName || "";
			form.value.lastName = authStore.user.lastName || "";
			form.value.avatar = authStore.user.avatar || "";
			form.value.avatarFile = null;
			avatarFile.value = null;

			// Restaurar preview del avatar
			if (authStore.user.avatar) {
				avatarPreview.value = authStore.user.avatar;
			} else {
				avatarPreview.value = null;
			}

			if (authStore.user.information) {
				form.value.information = {
					profession: authStore.user.information.profession || null,
					specialty: authStore.user.information.specialty || null,
					phone: authStore.user.information.phone || null,
					gender: authStore.user.information.gender || null,
					birthDate: authStore.user.information.birthDate
						? new Date(authStore.user.information.birthDate).toISOString().split("T")[0]
						: null,
					experience: authStore.user.information.experience || null,
				};
			} else {
				form.value.information = {
					profession: null,
					specialty: null,
					phone: null,
					gender: null,
					birthDate: null,
					experience: null,
				};
			}
		}
		successMessage.value = "";
		avatarError.value = null;
	};
</script>

<style scoped></style>
