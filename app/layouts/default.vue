<template>
	<div class="flex min-h-screen flex-col">
		<LayoutHeader />
		<main class="flex w-full flex-grow bg-surface-container" :class="{ 'dark:bg-surface-container-dark': route.path === '/' }">
			<slot />
		</main>
		<LayoutFooter />
		<ToastContainer />
		<ConfirmDialog />
	</div>
</template>

<script setup>
const route = useRoute()
</script>
