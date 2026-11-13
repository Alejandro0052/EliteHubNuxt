import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-05-15",
	devtools: { enabled: false },
	css: ["~/assets/css/main.css"],
	app: {
		head: {
			script: [
				{
					innerHTML: `(function () {
	try {
		var t = localStorage.getItem('elite-hub-theme');
		if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
	} catch (e) {}
})();`,
					type: "text/javascript",
				},
			],
		},
	},
	modules: [
		// @nuxt/icon is auto-registered by @nuxt/ui -- listing it again caused a
		// duplicate-template build failure (NUXT_B1001 / UNLOADABLE_DEPENDENCY on
		// nuxt-icon-client-bundle), so it's intentionally absent here now.
		"@nuxt/ui",
		"@nuxt/image",
		"@sidebase/nuxt-auth",
		"@hypernym/nuxt-anime",
		"@pinia/nuxt",
	],
	ui: {
		// Dark mode stays owned by useTheme.ts + the data-theme attribute set up in
		// Story 7.1 (inline head script + localStorage). Nuxt UI's components use plain
		// Tailwind `dark:` utility classes, so they already follow our existing
		// @custom-variant dark definition in main.css without needing their own
		// color-mode module -- enabling it would create two competing systems fighting
		// over dark-mode state, the exact bug pattern already hit repeatedly post-Epic-7.
		colorMode: false,
	},
	nitro: {
		storage: {
			public: {
				driver: "fs",
				base: "./server/public",
			},
		},
	},
	auth: {
		isEnabled: true,
		disableServerSideAuth: false,
		originEnvKey: process.env.AUTH_ORIGIN,
		baseURL: "http://localhost:3000/api/auth",
		globalAppMiddleware: {
			isEnabled: true,
			allow404WithoutAuth: false,
			addDefaultCallbackUrl: true,
		},
		provider: {
			type: "authjs",
			trustHost: true,
		},
		pages: {
			signIn: "/login",
			signUp: "/register",
		},
		sessionRefresh: {
			enableOnWindowFocus: true,
		},
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
