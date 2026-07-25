<template>
	<div class="pointer-events-none fixed top-20 right-4 z-[100] flex flex-col gap-2">
		<TransitionGroup name="toast">
			<div
				v-for="toast in toasts"
				:key="toast.id"
				class="pointer-events-auto flex min-w-[260px] max-w-sm items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg"
				:class="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'">
				<Icon
					:name="toast.type === 'success' ? 'fa6-solid:circle-check' : 'fa6-solid:circle-exclamation'"
					class="flex-shrink-0" />
				<span class="flex-grow">{{ toast.message }}</span>
				<button
					type="button"
					class="flex-shrink-0 text-white/80 hover:text-white"
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
