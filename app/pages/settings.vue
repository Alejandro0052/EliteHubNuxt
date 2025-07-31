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
							<label for="nombre" class="block text-sm font-medium text-gray-700">Nombre</label>
							<input
								id="nombre"
								v-model="form.nombre"
								type="text"
								required
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-black focus:outline-none" />
						</div>

						<div>
							<label for="apellido" class="block text-sm font-medium text-gray-700">Apellido</label>
							<input
								id="apellido"
								v-model="form.apellido"
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
							<label for="profesion" class="block text-sm font-medium text-gray-700"
								>Profesión</label
							>
							<input
								id="profesion"
								v-model="form.informacion.profesion"
								type="text"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-black focus:outline-none" />
						</div>

						<div>
							<label for="especialidad" class="block text-sm font-medium text-gray-700"
								>Especialidad</label
							>
							<input
								id="especialidad"
								v-model="form.informacion.especialidad"
								type="text"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-black focus:outline-none" />
						</div>

						<div>
							<label for="telefono" class="block text-sm font-medium text-gray-700">Teléfono</label>
							<input
								id="telefono"
								v-model="form.informacion.telefono"
								type="tel"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-black focus:outline-none" />
						</div>

						<div>
							<label for="genero" class="block text-sm font-medium text-gray-700">Género</label>
							<select
								id="genero"
								v-model="form.informacion.genero"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-black focus:outline-none">
								<option value="">Selecciona una opción</option>
								<option value="masculino">Masculino</option>
								<option value="femenino">Femenino</option>
								<option value="otro">Otro</option>
								<option value="prefiero-no-decir">Prefiero no decir</option>
							</select>
						</div>

						<div>
							<label for="fechaNacimiento" class="block text-sm font-medium text-gray-700"
								>Fecha de Nacimiento</label
							>
							<input
								id="fechaNacimiento"
								v-model="form.informacion.fechaNacimiento"
								type="date"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-black focus:outline-none" />
						</div>
					</div>

					<div class="mt-4">
						<label for="experiencia" class="block text-sm font-medium text-gray-700"
							>Experiencia</label
						>
						<textarea
							id="experiencia"
							v-model="form.informacion.experiencia"
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
	// Importar el tipo de información de usuario del store de autenticación
	import type { UserInformacion } from "~/stores/auth";

	const authStore = useAuthStore();
	const isLoading = ref(false);
	const successMessage = ref("");
	const avatarFile = ref<File | null>(null);
	const avatarPreview = ref<string | null>(null);
	const avatarError = ref<string | null>(null);

	interface ProfileForm {
		nombre: string;
		apellido: string;
		avatar: string;
		avatarFile: File | null;
		informacion: UserInformacion;
	}

	// Inicializar el formulario con valores por defecto
	const form = ref<ProfileForm>({
		nombre: "",
		apellido: "",
		avatar: "",
		avatarFile: null,
		informacion: {
			profesion: null,
			especialidad: null,
			telefono: null,
			genero: null,
			fechaNacimiento: null,
			experiencia: null,
		} as UserInformacion,
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
				nombre: user.nombre || "",
				apellido: user.apellido || "",
				avatar: window.location.origin + user.avatar || "",
				avatarFile: null,
				informacion: {
					profesion: user.informacion?.profesion || null,
					especialidad: user.informacion?.especialidad || null,
					telefono: user.informacion?.telefono || null,
					genero: user.informacion?.genero || null,
					fechaNacimiento: user.informacion?.fechaNacimiento
						? new Date(user.informacion.fechaNacimiento).toISOString().split("T")[0]
						: null,
					experiencia: user.informacion?.experiencia || null,
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
		if (form.value.avatar) {
			avatarPreview.value = form.value.avatar;
		}
	});

	// Función para actualizar el perfil
	const updateProfile = async () => {
		try {
			isLoading.value = true;
			successMessage.value = "";

			const formData = new FormData();
			formData.append("nombre", form.value.nombre);
			formData.append("apellido", form.value.apellido);

			form.value.informacion.fechaNacimiento = form.value.informacion.fechaNacimiento
				? new Date(form.value.informacion.fechaNacimiento).toISOString()
				: null;

			// Agrega campos anidados como informacion
			Object.entries(form.value.informacion).forEach(([key, value]) => {
				if (value !== null) {
					formData.append(`informacion.${key}`, value as string);
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

			// Actualizar el store con los nuevos datos evitando asignación directa
			if (response.user && authStore.user) {
				// Actualiza propiedades básicas
				authStore.user.nombre = response.user.nombre;
				authStore.user.apellido = response.user.apellido;
				if (response.user.avatar) {
					authStore.user.avatar = response.user.avatar;
				}
				// Actualiza información adicional
				if (response.user.informacion) {
					Object.entries(response.user.informacion).forEach(([key, value]) => {
						authStore.user.informacion[key] = value;
					});
				}
				// Forzar recarga de datos para header y otros componentes
				await authStore.checkAuth();
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
			form.value.nombre = authStore.user.nombre || "";
			form.value.apellido = authStore.user.apellido || "";
			form.value.avatar = authStore.user.avatar || "";

			if (authStore.user.informacion) {
				form.value.informacion = {
					...form.value.informacion,
					...authStore.user.informacion,
				};
			} else {
				form.value.informacion = {
					profesion: null,
					especialidad: null,
					telefono: null,
					genero: null,
					fechaNacimiento: null,
					experiencia: null,
				};
			}
		}
		successMessage.value = "";
	};
</script>

<style scoped></style>
