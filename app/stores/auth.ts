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
  correo?: string | null;
  isAdmin?: boolean;
  rol?: { id: number; nombre: string } | null;
}

export const useAuthStore = defineStore("auth", () => {
  const { signIn, signOut, getSession } = useAuth();
  const isInitialized = ref(false);
  const isAuthenticated = ref(false);
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // --------------------
  // CHECK AUTH
  // --------------------
  async function checkAuth() {
    try {
      isLoading.value = true;
      error.value = null;

      const session = await getSession();

      if (session?.user) {
        // Inicialmente poblamos datos básicos desde la sesión
        user.value = {
          id: parseInt(session.user.id || "0"),
          nombre: session.user.firstName || session.user.name || "",
          apellido: session.user.lastName || "",
          avatar: null,
        };

        // Intentar cargar el perfil completo desde /api/profile
        try {
          const profile = await $fetch('/api/profile', { headers: useRequestHeaders(['cookie']) });
          if (profile) {
            user.value.nombre = profile.nombre || user.value.nombre;
            user.value.apellido = profile.apellido || user.value.apellido;
            user.value.avatar = profile.avatar || user.value.avatar;
            // Agregar informacion si viene
            if (profile.informacion) {
              (user.value as any).informacion = profile.informacion;
            }
            // agregar correo, isAdmin y rol si vienen
            (user.value as any).correo = profile.correo || (session.user.email as string | undefined) || null;
            (user.value as any).isAdmin = profile.isAdmin || false;
            (user.value as any).rol = profile.rol || null;
          }
        } catch (e) {
          // no bloquear el inicio de sesión si profile falla
          console.warn('No se pudo cargar perfil completo:', e);
        }

        isAuthenticated.value = true;
        return true;
      }

      user.value = null;
      isAuthenticated.value = false;
      return false;
    } catch (err: any) {
      console.error("Error en checkAuth:", err);
      error.value = err.message || "Error al verificar autenticación";
      isAuthenticated.value = false;
      user.value = null;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // --------------------
  // LOGIN
  // --------------------
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

      await checkAuth();
      return true;
    } catch (e) {
      error.value = "Error al iniciar sesión";
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // --------------------
  // REGISTER
  // --------------------
  async function register(userData: {
    nombre: string;
    apellido: string;
    correo: string;
    password: string;
  }) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await $fetch("/api/auth/register", {
        method: "POST",
        body: userData,
      });

      if (response) {
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

  // --------------------
  // LOGOUT
  // --------------------
  async function logout() {
    try {
      await signOut({ redirect: false });
    } finally {
      user.value = null;
      isAuthenticated.value = false;
    }
  }

  // --------------------
  // INIT
  // --------------------
  onMounted(async () => {
    if (!isInitialized.value) {
      await checkAuth();
      isInitialized.value = true;
    }
  });

  // --------------------
  // COMPUTED
  // --------------------
  const fullName = computed(() => {
    if (!user.value) return "";
    return `${user.value.nombre} ${user.value.apellido}`.trim();
  });

  const initials = computed(() => {
    if (!user.value) return "";
    return `${user.value.nombre.charAt(0)}${user.value.apellido.charAt(0)}`;
  });

  // --------------------
  // RETURN FINAL (corregido)
  // --------------------
  return {
    // STATE
    isAuthenticated: readonly(isAuthenticated),
    user: readonly(user),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isInitialized: readonly(isInitialized),
    fullName: readonly(fullName),
    initials: readonly(initials),

    // ACTIONS
    checkAuth,
    login,
    register,
    logout,
  };
});
