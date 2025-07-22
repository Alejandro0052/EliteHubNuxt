import { defineStore } from "pinia";

export interface UserInformacion {
	profesion?: string | null;
	especialidad?: string | null;
	telefono?: string | null;
	genero?: string | null;
	fechaNacimiento?: string | null;
	experiencia?: string | null;
}

interface User {
	id: number;
	nombre: string;
	apellido: string;
	avatar: string | null;
	informacion?: UserInformacion;
}

export const useAuthStore = defineStore("auth", () => {
	const { signIn, signOut, getSession } = useAuth();
	const isInitialized = ref(false);
	const isAuthenticated = ref(false);
	const user = ref<User | null>(null);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	// Verificar autenticación
	async function checkAuth() {
		try {
			isLoading.value = true;
			error.value = null;

			// Obtener sesión usando AuthJS
			const session = await getSession();

			if (session?.user) {
				user.value = {
					id: parseInt(session.user.id || "0"),
					nombre: session.user.firstName || session.user.name || "",
					apellido: session.user.lastName || "",
					avatar: null,
				};
				isAuthenticated.value = true;
				return true;
			}

			user.value = null;
			isAuthenticated.value = false;
			return false;
		} catch (error: any) {
			console.error("Error en checkAuth:", error);
			user.value = null;
			isAuthenticated.value = false;
			error.value = error.message || "Error al verificar autenticación";
			return false;
		} finally {
			isLoading.value = false;
		}
	}

	// Iniciar sesión
	async function login(credentials: { correo: string; password: string }) {
		isLoading.value = true;
		error.value = null;

		try {
			const result = await signIn("credentials", {
				email: credentials.correo,
				password: credentials.password,
				redirect: false,
			});

			if (result?.error) {
				error.value = "Credenciales inválidas";
				return false;
			}

			// Actualizar el estado después del login exitoso
			await checkAuth();
			return true;
		} catch (e: any) {
			user.value = null;
			isAuthenticated.value = false;
			error.value = "Error al iniciar sesión";
			return false;
		} finally {
			isLoading.value = false;
		}
	}

	// Registrar usuario
	async function register(userData: {
		nombre: string;
		apellido: string;
		correo: string;
		password: string;
	}) {
		isLoading.value = true;
		error.value = null;

		try {
			// Registrar usuario
			const response = await $fetch("/api/auth/register", {
				method: "POST",
				body: userData,
			});

			if (response) {
				// Después del registro exitoso, iniciar sesión automáticamente
				const loginResult = await signIn("credentials", {
					email: userData.correo,
					password: userData.password,
					redirect: false,
				});

				if (!loginResult?.error) {
					await checkAuth();
					return true;
				}
			}
			return false;
		} catch (e: any) {
			error.value = e.response?._data?.message || "Error al registrarse";
			return false;
		} finally {
			isLoading.value = false;
		}
	}

	// Cerrar sesión
	async function logout() {
		try {
			await signOut({ redirect: false });
			user.value = null;
			isAuthenticated.value = false;
		} catch (e) {
			console.error("Error al cerrar sesión:", e);
		}
	}

	// Inicializar el store
	onMounted(async () => {
		if (isInitialized.value) return;
		await checkAuth();
		isInitialized.value = true;
	});

	// Computed para el nombre completo
	const fullName = computed(() => {
		if (!user.value) return "";
		return `${user.value.nombre} ${user.value.apellido}`.trim();
	});

	const initials = computed(() => {
		if (!user.value) return "";
		return `${user.value.nombre.charAt(0)}${user.value.apellido.charAt(0)}`;
	});

	return {
		// State
		isAuthenticated: readonly(isAuthenticated),
		user: readonly(user),
		isLoading: readonly(isLoading),
		error: readonly(error),
		isInitialized: readonly(isInitialized),
		fullName: readonly(fullName),
		initials: readonly(initials),

		// Actions
		checkAuth,
		login,
		register,
		logout,
	};
});
