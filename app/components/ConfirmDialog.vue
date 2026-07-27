<template>
	<Teleport to="body">
		<div
			v-if="state.open"
			class="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
			@click.self="respond(false)">
			<div class="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
				<h3 class="text-lg font-bold text-gray-900">{{ state.title || "Confirmar acción" }}</h3>
				<p class="mt-2 text-sm text-gray-600">{{ state.message }}</p>
				<div class="mt-6 flex justify-end gap-3">
					<button
						type="button"
						@click="respond(false)"
						class="rounded-full border border-gray-900 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50">
						{{ state.cancelText || "Cancelar" }}
					</button>
					<button
						type="button"
						@click="respond(true)"
						class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700">
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
