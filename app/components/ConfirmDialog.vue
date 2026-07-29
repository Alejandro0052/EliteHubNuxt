<template>
	<Teleport to="body">
		<div
			v-if="state.open"
			class="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
			@click.self="respond(false)">
			<div class="w-full max-w-sm rounded-xl bg-surface p-6 shadow-xl dark:bg-surface-container-dark">
				<h3 class="text-lg font-bold text-on-surface dark:text-on-surface-dark">{{ state.title || "Confirmar acción" }}</h3>
				<p class="mt-2 text-sm text-on-surface-variant dark:text-on-surface-variant-dark">{{ state.message }}</p>
				<div class="mt-6 flex justify-end gap-3">
					<button
						type="button"
						@click="respond(false)"
						class="button-secondary px-4 py-2 text-sm font-medium">
						{{ state.cancelText || "Cancelar" }}
					</button>
					<button
						type="button"
						@click="respond(true)"
						class="button-destructive px-4 py-2 text-sm font-semibold">
						{{ state.confirmText || "Eliminar" }}
					</button>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup>
const { state, respond } = useConfirm();
</script>
