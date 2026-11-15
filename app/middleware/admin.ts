export default defineNuxtRouteMiddleware(() => {
	const { status, data } = useAuth();

	if (status.value !== "authenticated" || !data.value?.user?.isAdmin) {
		return navigateTo("/");
	}
});
