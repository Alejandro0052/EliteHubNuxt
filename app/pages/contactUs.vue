<template>
	<div class="w-full min-h-screen bg-surface-container dark:bg-surface-container-dark">
	<div class="mx-auto max-w-page-shell pt-12 pb-16 md:pt-16">
		<div class="px-4 sm:px-6 lg:px-8">
			<DirectoryHeader
				:title="pageContent.title || 'Contacto'"
				:subtitle="pageContent.subtitle || 'Escríbenos y te respondemos en menos de 24 horas.'" />
		</div>

		<!-- Main Content -->
		<section class="mt-8 px-4 sm:px-6 lg:px-8">
			<!-- Custom Content -->
			<div v-if="pageContent.content" class="mb-10 max-w-[75ch] text-on-surface dark:text-on-surface-dark">
				<div v-html="pageContent.content"></div>
			</div>

			<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
				<!-- Contact Form -->
				<div class="flex flex-col justify-center p-6 sm:p-8 rounded-lg border border-border-hairline bg-surface dark:border-border-hairline-dark dark:bg-surface-container-dark">
					<div v-if="submitted" class="py-8 text-center">
						<Icon name="fa6-solid:circle-check" class="mb-4 text-5xl text-primary dark:text-primary-dark" />
						<p class="text-xl font-bold text-on-surface dark:text-on-surface-dark">Mensaje enviado. Te responderemos pronto.</p>
					</div>

					<template v-else>
					<h2 class="mb-6 font-display text-4xl leading-none font-extrabold uppercase text-on-surface dark:text-on-surface-dark">Envíanos un mensaje</h2>
					<form @submit.prevent="submitForm" class="space-y-6">
						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div>
								<label for="firstName" class="form-label mb-2 block"
									>Nombre</label
								>
								<input
									v-model="form.firstName"
									type="text"
									id="firstName"
									required
									class="form-control w-full"
									placeholder="Tu nombre" />
							</div>
							<div>
								<label for="lastName" class="form-label mb-2 block"
									>Apellido</label
								>
								<input
									v-model="form.lastName"
									type="text"
									id="lastName"
									required
									class="form-control w-full"
									placeholder="Tu apellido" />
							</div>
						</div>

						<div>
							<label for="email" class="form-label mb-2 block"
								>Correo electrónico</label
							>
							<input
								v-model="form.email"
								type="email"
								id="email"
								required
								class="form-control w-full"
								placeholder="tu@email.com" />
						</div>

						<div>
							<label for="phone" class="form-label mb-2 block"
								>Teléfono (Opcional)</label
							>
							<input
								v-model="form.phone"
								type="tel"
								id="phone"
								class="form-control w-full"
								placeholder="+57 300 123 4567" />
						</div>

						<div>
							<label for="subject" class="form-label mb-2 block"
								>Asunto</label
							>
							<select
								v-model="form.subject"
								id="subject"
								required
								class="form-control w-full">
								<option value="">Selecciona un asunto</option>
								<option value="Consulta General">Consulta General</option>
								<option value="Soporte Técnico">Soporte Técnico</option>
								<option value="Alianzas y Patrocinios">Alianzas y Patrocinios</option>
								<option value="Servicios de Nutrición">Servicios de Nutrición</option>
								<option value="Entrenamiento Deportivo">Entrenamiento Deportivo</option>
								<option value="Otro">Otro</option>
							</select>
						</div>

						<div>
							<label for="message" class="form-label mb-2 block"
								>Mensaje</label
							>
							<textarea
								v-model="form.message"
								id="message"
								rows="6"
								required
								class="form-control w-full resize-none"
								placeholder="Escribe tu mensaje aquí..."></textarea>
						</div>

						<button
							type="submit"
							:disabled="loading"
							class="button-primary w-full px-6 py-3 font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
							{{ loading ? "Enviando..." : "Enviar mensaje" }}
						</button>
					</form>
					</template>
				</div>

				<!-- Contact Information -->
				<div class="space-y-8">
					<!-- Contact Cards -->
					<div class="grid grid-cols-1 gap-6">
						<div
							class="p-6 rounded-lg border border-border-hairline bg-surface dark:border-border-hairline-dark dark:bg-surface-container-dark">
							<div class="flex items-start">
								<div
									class="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black text-white">
									<Icon name="fa6-solid:inbox" />
								</div>
								<div>
									<h3 class="mb-2 text-lg font-bold text-on-surface dark:text-on-surface-dark">Correo electrónico</h3>
									<p class="mb-2 text-on-surface-variant dark:text-on-surface-variant-dark">Respuesta en menos de 24 horas</p>
									<a
										href="mailto:info@elitehub.com"
										class="font-semibold text-primary underline-offset-2 hover:underline dark:text-primary-dark"
										>info@elitehub.com</a
									>
								</div>
							</div>
						</div>

						<div
							class="p-6 rounded-lg border border-border-hairline bg-surface dark:border-border-hairline-dark dark:bg-surface-container-dark">
							<div class="flex items-start">
								<div
									class="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black text-white">
									<Icon name="fa6-solid:phone" />
								</div>
								<div>
									<h3 class="mb-2 text-lg font-bold text-on-surface dark:text-on-surface-dark">Teléfono</h3>
									<p class="mb-2 text-on-surface-variant dark:text-on-surface-variant-dark">Lunes a Viernes, 8:00 AM - 6:00 PM</p>
									<a href="tel:+5712345678" class="font-semibold text-primary underline-offset-2 hover:underline dark:text-primary-dark"
										>+57 (1) 234-5678</a
									>
								</div>
							</div>
						</div>

						<div
							class="p-6 rounded-lg border border-border-hairline bg-surface dark:border-border-hairline-dark dark:bg-surface-container-dark">
							<div class="flex items-start">
								<div
									class="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black text-white">
									<Icon name="fa6-solid:location-dot" />
								</div>
								<div>
									<h3 class="mb-2 text-lg font-bold text-on-surface dark:text-on-surface-dark">Oficina principal</h3>
									<p class="mb-2 text-on-surface-variant dark:text-on-surface-variant-dark">Visítanos en nuestras instalaciones</p>
									<p class="font-semibold text-on-surface dark:text-on-surface-dark">Calle 123 #45-67<br />Cali, Colombia</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Social Media -->
					<div class="p-6 rounded-lg border border-border-hairline bg-surface dark:border-border-hairline-dark dark:bg-surface-container-dark">
						<h3 class="mb-4 text-lg font-bold text-on-surface dark:text-on-surface-dark">Síguenos en redes sociales</h3>
						<div class="flex space-x-4">
							<a
								href="#"
								class="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors duration-300 hover:bg-primary dark:bg-white dark:text-black dark:hover:bg-primary-dark">
								<Icon name="fa-brands:facebook-f" />
							</a>
							<a
								href="#"
								class="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors duration-300 hover:bg-primary dark:bg-white dark:text-black dark:hover:bg-primary-dark">
								<Icon name="fa-brands:twitter" />
							</a>
							<a
								href="#"
								class="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors duration-300 hover:bg-primary dark:bg-white dark:text-black dark:hover:bg-primary-dark">
								<Icon name="fa-brands:tiktok" />
							</a>
							<a
								href="#"
								class="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors duration-300 hover:bg-primary dark:bg-white dark:text-black dark:hover:bg-primary-dark">
								<Icon name="fa-brands:youtube" />
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
	</div>
</template>

<script setup>
	definePageMeta({
		auth: false,
		title: "Contáctanos - EliteHub",
		description: "Ponte en contacto con el equipo de EliteHub. Estamos aquí para ayudarte",
	});

	const { getContent } = useContent();
	const { showToast } = useToast();

	const pageContent = ref({
		title: "",
		subtitle: "",
		content: "",
		metadata: {},
	});

	const loading = ref(false);
	const submitted = ref(false);

	const form = ref({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		subject: "",
		message: "",
	});

	const submitForm = async () => {
		loading.value = true;
		try {
			await $fetch("/api/mensajes-contacto", {
				method: "POST",
				body: form.value,
			});

			submitted.value = true;
		} catch (error) {
			console.error("Error sending message:", error);
			showToast("Error al enviar el mensaje. Por favor, inténtalo de nuevo.", "error");
		} finally {
			loading.value = false;
		}
	};

	// Load content on mount
	onMounted(async () => {
		try {
			const content = await getContent("contactUs");
			pageContent.value = content;
		} catch (error) {
			console.error("Error loading content:", error);
		}
	});
</script>

<style scoped></style>
