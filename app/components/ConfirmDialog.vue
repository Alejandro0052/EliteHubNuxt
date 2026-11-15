<template>
	<Teleport to="body">
		<div
			v-if="state.open"
			class="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4"
			@click.self="respond(false)">
			<div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" class="w-full max-w-sm p-6 shadow-xl rounded-lg border border-border-hairline bg-surface dark:border-border-hairline-dark dark:bg-surface-container-dark">
				<h3 id="confirm-title" class="font-display text-4xl leading-none font-extrabold uppercase text-on-surface dark:text-on-surface-dark">{{ state.title || "Confirmar acción" }}</h3>
				<p class="mt-3 text-on-surface-variant dark:text-on-surface-variant-dark">{{ state.message }}</p>
				<div class="mt-6 flex justify-end gap-3">
					<button
						type="button"
						@click="respond(false)"
						class="button-secondary px-4 py-2 font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
						{{ state.cancelText || "Cancelar" }}
					</button>
					<button
						type="button"
						@click="respond(true)"
						class="button-destructive px-4 py-2 font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
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
