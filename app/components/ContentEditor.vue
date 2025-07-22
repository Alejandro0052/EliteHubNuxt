<template>
	<div>
		<!-- Edit Button (only visible for admins) -->
		<button
			v-if="isAdmin"
			@click="openModal"
			class="fixed top-20 right-4 z-40 rounded-full bg-blue-600 p-3 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-blue-700"
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
					class="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity"
					@click="closeModal"></div>

				<!-- Modal panel -->
				<div
					class="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
					<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
						<div class="sm:flex sm:items-start">
							<div class="w-full">
								<h3 class="mb-4 text-lg leading-6 font-medium text-gray-900" id="modal-title">
									Editar contenido de {{ page }}
								</h3>

								<form @submit.prevent="saveContent" class="space-y-4">
									<div>
										<label for="title" class="block text-sm font-medium text-gray-700"
											>Título</label
										>
										<input
											v-model="formData.title"
											type="text"
											id="title"
											class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
											placeholder="Título de la página" />
									</div>

									<div>
										<label for="subtitle" class="block text-sm font-medium text-gray-700"
											>Subtítulo</label
										>
										<input
											v-model="formData.subtitle"
											type="text"
											id="subtitle"
											class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
											placeholder="Subtítulo de la página" />
									</div>

									<div>
										<label for="content" class="block text-sm font-medium text-gray-700"
											>Contenido</label
										>
										<textarea
											v-model="formData.content"
											id="content"
											rows="10"
											class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
											placeholder="Contenido de la página (HTML permitido)"></textarea>
									</div>
								</form>
							</div>
						</div>
					</div>

					<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						<button
							@click="saveContent"
							:disabled="loading"
							type="button"
							class="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm">
							{{ loading ? "Guardando..." : "Guardar" }}
						</button>
						<button
							@click="closeModal"
							type="button"
							class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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
			// Show success message
			alert("Contenido actualizado exitosamente");
		} catch (error) {
			console.error("Error saving content:", error);
			alert("Error al guardar el contenido");
		} finally {
			loading.value = false;
		}
	};
</script>
