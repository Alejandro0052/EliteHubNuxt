<template>
	<div class="mx-auto w-full max-w-[120rem] px-4 py-6">
		<div class="rounded-lg bg-white p-6 shadow-md">
			<h1 class="mb-6 text-2xl font-bold text-gray-800">Configuración de Perfil</h1>

			<!-- Admin quick link -->
			<div v-if="authStore.user?.isAdmin" class="mb-6">
				<NuxtLink to="/admin/users" class="inline-flex items-center gap-2 rounded-md bg-green-400 hover:bg-green-500 px-3 py-2 text-sm font-medium text-white">
					<Icon name="fa6-solid:users" />
					Gestión de usuarios
				</NuxtLink>
			</div>

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

						<div>
							<label for="correo" class="block text-sm font-medium text-gray-700">Correo</label>
							<div class="mt-1 flex items-end gap-3">
								<input
									id="correo"
									v-model="form.correo"
									type="email"
									required
									class="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-black focus:outline-none" />

								<div class="flex w-80 items-center gap-2">
									<input
										type="password"
										placeholder="Nueva contraseña"
										v-model="newPassword"
										class="flex-1 rounded-md border-gray-300 px-2 py-1 shadow-sm focus:ring-2 focus:ring-black focus:outline-none" />
									<button
										type="button"
										:disabled="isChangingPassword"
										@click="changePassword"
										class="rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
										Cambiar contraseña
										</button>
								</div>
							</div>
						</div>
						<div class="mt-1 w-80">
							<p v-if="passwordMessage" class="text-sm text-green-600">{{ passwordMessage }}</p>
							<p v-if="passwordError" class="text-sm text-red-600">{{ passwordError }}</p>
						</div>

						<div>
							<label for="tipoUsuario" class="block text-sm font-medium text-gray-700">Tipo de usuario</label>
							<select
								id="tipoUsuario"
								v-model.number="form.informacion.tipoUsuarioId"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-black focus:outline-none">
								<option value="">Selecciona un tipo</option>
								<option v-for="t in tiposUsuario" :key="t.id" :value="t.id">{{ t.tipo }}</option>
							</select>
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
							<label for="profesion" class="block text-sm font-medium text-gray-700">Profesión</label>
							<input
								id="profesion"
								v-model="form.informacion.profesion"
								type="text"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-black focus:outline-none" />
						</div>

						<div>
							<label for="especialidad" class="block text-sm font-medium text-gray-700">Especialidad</label>
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
							<label for="fechaNacimiento" class="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
							<input
								id="fechaNacimiento"
								v-model="form.informacion.fechaNacimiento"
								type="date"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-black focus:outline-none" />
						</div>
					</div>

					<div class="mt-4">
						<label for="experiencia" class="block text-sm font-medium text-gray-700">Experiencia</label>
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
	import { useAuthStore } from '~/stores/auth'
	import { ref } from 'vue'

	const authStore = useAuthStore();
	const tiposUsuario = ref<Array<{ id: number; tipo: string }>>([]);
	const isLoading = ref(false);
	const isChangingPassword = ref(false);
	const successMessage = ref("");
	const passwordMessage = ref<string | null>(null);
	const passwordError = ref<string | null>(null);
	const newPassword = ref('');
	const avatarFile = ref<File | null>(null);
	const avatarPreview = ref<string | null>(null);
	const avatarError = ref<string | null>(null);

	interface ProfileForm {
		nombre: string;
		apellido: string;
		correo: string;
		avatar: string;
		avatarFile: File | null;
		informacion: UserInformacion;
	}

	// Inicializar el formulario con valores por defecto
	const form = ref<ProfileForm>({
		nombre: "",
		apellido: "",
		correo: "",
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

			// Cargar tipos de usuario para el selector
			try {
				tiposUsuario.value = await $fetch('/api/tipousuario');
			} catch (e) {
				console.error('No se pudieron cargar los tipos de usuario:', e);
			}

			form.value = {
				nombre: user.nombre || "",
				apellido: user.apellido || "",
				correo: user.correo || user.email || "",
				avatar: user.avatar ? (user.avatar.startsWith('http') ? user.avatar : window.location.origin + user.avatar) : "",
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
					tipoUsuarioId: user.informacion?.tipoUsuario?.id || user.informacion?.tipoUsuarioId || null,
				},
			};

			if (user.avatar) {
				avatarPreview.value = user.avatar.startsWith('http') ? user.avatar : window.location.origin + user.avatar;
			}
		} catch (error) {
			console.error("Error al cargar los datos del usuario:", error);
		}
	}

	// Cargar datos al montar
	loadUserData();

	const resetForm = () => {
		loadUserData();
		avatarFile.value = null;
		avatarPreview.value = null;
		avatarError.value = null;
		successMessage.value = '';
	}

	const updateProfile = async () => {
		isLoading.value = true;
		try {
			// Build a plain payload object to avoid cloning reactive proxies or File objects
			const fv: any = form.value

			// Normalize avatar before sending: if it's a full URL, strip the origin so server stores a relative path
			let avatarToSend: string | null = fv.avatar || null
			try {
				if (avatarToSend && avatarToSend.startsWith(window.location.origin)) {
					avatarToSend = avatarToSend.replace(window.location.origin, '')
				}
			} catch (e) {
				// defensive: in case window is not available or other issue
			}

			const body: any = {
				nombre: fv.nombre,
				apellido: fv.apellido,
				correo: fv.correo,
				avatar: avatarToSend,
				informacion: {
					profesion: fv.informacion?.profesion || null,
					especialidad: fv.informacion?.especialidad || null,
					telefono: fv.informacion?.telefono || null,
					genero: fv.informacion?.genero || null,
					fechaNacimiento: fv.informacion?.fechaNacimiento || null,
					experiencia: fv.informacion?.experiencia || null,
					tipoUsuarioId: fv.informacion?.tipoUsuarioId ?? null,
				}
			}

			// manejar avatarFile si hay
			if (avatarFile.value) {
				const fd = new FormData();
				fd.append('avatar', avatarFile.value);
				const upload = await $fetch('/api/profile/avatar', { method: 'POST', body: fd });
				body.avatar = upload.url;
			}

			await $fetch('/api/profile', { method: 'PUT', body });
			successMessage.value = 'Perfil actualizado correctamente.';
			await authStore.checkAuth();
		} catch (err) {
			console.error('Error updating profile', err);
		} finally {
			isLoading.value = false;
		}
	}

	const changePassword = async () => {
		passwordMessage.value = null;
		passwordError.value = null;
		if (!newPassword.value || newPassword.value.length < 6) {
			passwordError.value = 'La contraseña debe tener al menos 6 caracteres.';
			return;
		}
		isChangingPassword.value = true;
		try {
			const res = await $fetch('/api/profile/change-password', {
				method: 'POST',
				body: { newPassword: newPassword.value }
			});
			passwordMessage.value = res?.message || 'Contraseña cambiada correctamente.';
			newPassword.value = '';
		} catch (err: any) {
			console.error('Error cambiando contraseña', err);
			passwordError.value = err?.message || 'Error cambiando la contraseña.';
		} finally {
			isChangingPassword.value = false;
		}
	}
</script>

*** End Patch
