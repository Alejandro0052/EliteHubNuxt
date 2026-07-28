<template>
	<div class="flex min-h-screen flex-col">
		<LayoutHeader />
		<main class="flex w-full flex-grow bg-neutral-100" :class="{ 'dark:bg-neutral-900': route.path === '/' }">
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
