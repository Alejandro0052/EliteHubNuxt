<template>
	<div class="flex min-h-screen flex-col">
		<LayoutHeader />
		<main class="flex w-full flex-grow bg-neutral-100 dark:bg-neutral-900">
			<slot />
		</main>
		<LayoutFooter />
	</div>
</template>
