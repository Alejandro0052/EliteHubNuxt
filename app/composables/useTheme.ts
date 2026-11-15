export type Theme = "light" | "dark";

const STORAGE_KEY = "elite-hub-theme";

export function useTheme() {
	const theme = useState<Theme>("theme", () => "light");
	const announcement = useState<string>("theme-announcement", () => "");

	function applyTheme(value: Theme) {
		if (typeof document !== "undefined") {
			if (value === "dark") {
				document.documentElement.setAttribute("data-theme", "dark");
			} else {
				document.documentElement.removeAttribute("data-theme");
			}
		}

		try {
			localStorage.setItem(STORAGE_KEY, value);
		} catch (e) {
			// localStorage no disponible (SSR o navegador restringido)
		}

		theme.value = value;
		announcement.value = value === "dark" ? "Tema oscuro activado" : "Tema claro activado";
	}

	function toggleTheme() {
		applyTheme(theme.value === "dark" ? "light" : "dark");
	}

	function initTheme() {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			theme.value = stored === "dark" ? "dark" : "light";
		} catch (e) {
			theme.value = "light";
		}
	}

	return { theme, announcement, toggleTheme, initTheme };
}
