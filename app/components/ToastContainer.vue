<template>
	<div aria-live="polite" class="pointer-events-none fixed top-20 right-4 z-[120] flex flex-col gap-2">
		<TransitionGroup name="toast">
			<div
				v-for="toast in toasts"
				:key="toast.id"
				class="pointer-events-auto flex min-w-[260px] max-w-sm items-center gap-3 rounded-lg border-l-8 bg-black px-4 py-3 font-semibold text-white shadow-lg dark:bg-white dark:text-black"
				:class="toast.type === 'success' ? 'border-primary-dark dark:border-primary' : 'border-destructive'">
				<Icon
					:name="toast.type === 'success' ? 'fa6-solid:circle-check' : 'fa6-solid:circle-exclamation'"
					aria-hidden="true" class="flex-shrink-0 text-lg" :class="toast.type === 'success' ? 'text-primary-dark dark:text-primary' : 'text-destructive-dark dark:text-destructive'" />
				<span class="flex-grow">{{ toast.message }}</span>
				<button
					type="button"
					aria-label="Cerrar aviso" class="flex-shrink-0 rounded opacity-70 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-current"
					@click="dismissToast(toast.id)">
					<Icon name="fa6-solid:xmark" />
				</button>
			</div>
		</TransitionGroup>
	</div>
</template>

<script setup>
	const { toasts, dismissToast } = useToast();
</script>

<style scoped>
	.toast-enter-active,
	.toast-leave-active {
		transition: all 0.3s ease;
	}
	.toast-enter-from {
		opacity: 0;
		transform: translateX(30px);
	}
	.toast-leave-to {
		opacity: 0;
		transform: translateX(30px);
	}
</style>
