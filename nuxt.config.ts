import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-05-15",
	devtools: { enabled: false },
	css: ["~/assets/css/main.css"],
	modules: [
		"@nuxt/icon",
		"@nuxt/image",
		"@sidebase/nuxt-auth",
		"@hypernym/nuxt-anime",
		"@pinia/nuxt",
	],
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
