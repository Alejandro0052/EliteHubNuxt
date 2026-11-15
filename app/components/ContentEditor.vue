<template>
	<div>
		<!-- Edit Button (only visible for admins) -->
		<button
			v-if="isAdmin"
			@click="openModal"
			type="button"
			class="button-primary fixed top-20 right-4 z-40 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark"
			aria-label="Editar contenido"
			title="Editar contenido">
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
			</svg>
		</button>

		<!-- Modal -->
		<div
			v-if="showModal"
			class="fixed inset-0 z-50 overflow-y-auto"
			aria-labelledby="modal-title"
			role="dialog"
			aria-modal="true">
			<div
				class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
				<!-- Background overlay -->
				<div
					class="fixed inset-0 bg-black/60"
					@click="closeModal"></div>

				<!-- Modal panel -->
				<div
					class="relative z-10 inline-block w-full overflow-hidden text-left align-bottom shadow-xl sm:my-8 sm:max-w-4xl sm:align-middle rounded-lg border border-border-hairline bg-surface dark:border-border-hairline-dark dark:bg-surface-container-dark">
					<div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
						<div class="sm:flex sm:items-start">
							<div class="w-full">
								<h3 class="mb-5 border-b-2 border-on-surface pb-3 font-display text-4xl leading-none font-extrabold uppercase dark:border-on-surface-dark text-on-surface dark:text-on-surface-dark" id="modal-title">
									Editar contenido
								</h3>

								<form @submit.prevent="saveContent" class="space-y-4">
									<div>
										<label for="title" class="form-label block"
											>Título</label
										>
										<input
											v-model="formData.title"
											type="text"
											id="title"
											class="form-control mt-1 block w-full"
											placeholder="Título de la página" />
									</div>

									<div>
										<label for="subtitle" class="form-label block"
											>Subtítulo</label
										>
										<input
											v-model="formData.subtitle"
											type="text"
											id="subtitle"
											class="form-control mt-1 block w-full"
											placeholder="Subtítulo de la página" />
									</div>

									<div>
										<label for="content" class="form-label block"
											>Contenido</label
										>
										<textarea
											v-model="formData.content"
											id="content"
											rows="10"
											class="form-control mt-1 block w-full"
											placeholder="Contenido de la página (HTML permitido)"></textarea>
									</div>
								</form>
							</div>
						</div>
					</div>

					<div class="border-t border-border-hairline px-4 py-4 sm:flex sm:flex-row-reverse sm:px-6 dark:border-border-hairline-dark">
						<button
							@click="saveContent"
							:disabled="loading"
							type="button"
							class="button-primary inline-flex w-full justify-center px-5 py-2 font-semibold sm:ml-3 sm:w-auto focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
							{{ loading ? "Guardando…" : "Guardar cambios" }}
						</button>
						<button
							@click="closeModal"
							type="button"
							class="button-secondary mt-3 inline-flex w-full justify-center px-5 py-2 font-semibold sm:mt-0 sm:w-auto focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
							Cancelar
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	const props = defineProps({
		page: {
			type: String,
			required: true,
		},
		initialContent: {
			type: Object,
			default: () => ({}),
		},
	});

	const emit = defineEmits(["updated"]);

	const { isAdmin, updateContent } = useContent();
	const { showToast } = useToast();
	const showModal = ref(false);
	const loading = ref(false);

	const formData = ref({
		title: "",
		subtitle: "",
		content: "",
		metadata: {},
	});

	const openModal = () => {
		formData.value = {
			title: props.initialContent.title || "",
			subtitle: props.initialContent.subtitle || "",
			content: props.initialContent.content || "",
			metadata: props.initialContent.metadata || {},
		};
		showModal.value = true;
	};

	const closeModal = () => {
		showModal.value = false;
	};

	const saveContent = async () => {
		loading.value = true;
		try {
			const updatedContent = await updateContent(props.page, formData.value);
			emit("updated", updatedContent);
			closeModal();
			showToast("Cambios guardados", "success");
		} catch (error) {
			console.error("Error saving content:", error);
			showToast("No se pudieron guardar los cambios. Inténtalo de nuevo.", "error");
		} finally {
			loading.value = false;
		}
	};
</script>
