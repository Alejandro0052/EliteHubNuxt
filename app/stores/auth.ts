import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", () => {
	const { signIn, signOut, getSession } = useAuth();
	const isInitialized = ref(false);
	const isAuthenticated = ref(false);
	const user = ref<any | null>(null);
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
				// Obtener datos completos del usuario desde la API
				try {
					const userData = await $fetch("/api/profile", {
						headers: useRequestHeaders(["cookie"]),
					});

					user.value = {
						id: userData.id,
						firstName: userData.firstName,
						lastName: userData.lastName,
						avatar: userData.avatar,
						isAdmin: userData.isAdmin || false,
						information: userData.information || undefined,
					};
				} catch (apiError) {
					// Fallback a datos de sesión si falla la API
					user.value = {
						id: parseInt((session as any).user.id || "0"),
						firstName: (session as any).user.firstName || session.user.name || "",
						lastName: (session as any).user.lastName || "",
						avatar: null,
						isAdmin: (session as any).user.isAdmin || false,
					};
				}
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
		return `${user.value.firstName} ${user.value.lastName}`.trim();
	});

	const initials = computed(() => {
		if (!user.value) return "";
		return `${user.value.firstName.charAt(0)}${user.value.lastName.charAt(0)}`;
	});

	// Función para actualizar el usuario (útil para actualizaciones de perfil)
	function updateUser(userData: Partial<any>) {
		if (user.value) {
			user.value = { ...user.value, ...userData };
		}
	}

	return {
		// State
		isAuthenticated: readonly(isAuthenticated),
		user,
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
		updateUser,
	};
});
