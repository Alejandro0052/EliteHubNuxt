export default defineNuxtPlugin(() => {
	const interceptedFetch = $fetch.create({
		onResponseError({ response }) {
			if (response.status === 401) {
				const { showToast } = useToast();
				showToast("Tu sesión ya no es válida. Inicia sesión de nuevo.", "error");
				navigateTo("/login");
			}
		},
	});

	globalThis.$fetch = interceptedFetch as typeof $fetch;
});
