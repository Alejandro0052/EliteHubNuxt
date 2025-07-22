<template>
	<div class="mx-auto min-h-screen py-10">
		<!-- Content Editor for Admins -->
		<ContentEditor page="contactUs" :initial-content="pageContent" @updated="handleContentUpdate" />

		<!-- Hero Section -->
		<section class="relative px-4 sm:px-6 lg:px-8">
			<div class="text-center">
				<h1 class="mb-6 text-4xl font-bold text-white md:text-6xl">
					{{ pageContent.title || "Contáctanos" }}
				</h1>
				<p class="mx-auto mb-8 max-w-3xl text-xl text-gray-300 md:text-2xl">
					{{
						pageContent.subtitle ||
						"Estamos aquí para ayudarte. Ponte en contacto con nuestro equipo"
					}}
				</p>
			</div>
		</section>

		<!-- Main Content -->
		<section class="px-4 sm:px-6 lg:px-8">
			<!-- Custom Content -->
			<div v-if="pageContent.content" class="mb-16">
				<div class="max-w-none" v-html="pageContent.content"></div>
			</div>

			<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
				<!-- Contact Form -->
				<div class="flex flex-col justify-center rounded-xl bg-white p-8 shadow-lg">
					<h2 class="mb-6 text-2xl font-bold text-gray-900">Envíanos un mensaje</h2>
					<form @submit.prevent="submitForm" class="space-y-6">
						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div>
								<label for="firstName" class="mb-2 block text-sm font-medium text-gray-700"
									>Nombre</label
								>
								<input
									v-model="form.firstName"
									type="text"
									id="firstName"
									required
									class="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors duration-300 focus:border-transparent focus:ring-2 focus:ring-blue-500"
									placeholder="Tu nombre" />
							</div>
							<div>
								<label for="lastName" class="mb-2 block text-sm font-medium text-gray-700"
									>Apellido</label
								>
								<input
									v-model="form.lastName"
									type="text"
									id="lastName"
									required
									class="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors duration-300 focus:border-transparent focus:ring-2 focus:ring-blue-500"
									placeholder="Tu apellido" />
							</div>
						</div>

						<div>
							<label for="email" class="mb-2 block text-sm font-medium text-gray-700"
								>Correo Electrónico</label
							>
							<input
								v-model="form.email"
								type="email"
								id="email"
								required
								class="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors duration-300 focus:border-transparent focus:ring-2 focus:ring-blue-500"
								placeholder="tu@email.com" />
						</div>

						<div>
							<label for="phone" class="mb-2 block text-sm font-medium text-gray-700"
								>Teléfono (Opcional)</label
							>
							<input
								v-model="form.phone"
								type="tel"
								id="phone"
								class="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors duration-300 focus:border-transparent focus:ring-2 focus:ring-blue-500"
								placeholder="+57 300 123 4567" />
						</div>

						<div>
							<label for="subject" class="mb-2 block text-sm font-medium text-gray-700"
								>Asunto</label
							>
							<select
								v-model="form.subject"
								id="subject"
								required
								class="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors duration-300 focus:border-transparent focus:ring-2 focus:ring-blue-500">
								<option value="">Selecciona un asunto</option>
								<option value="general">Consulta General</option>
								<option value="support">Soporte Técnico</option>
								<option value="partnership">Alianzas y Patrocinios</option>
								<option value="nutrition">Servicios de Nutrición</option>
								<option value="training">Entrenamiento Deportivo</option>
								<option value="other">Otro</option>
							</select>
						</div>

						<div>
							<label for="message" class="mb-2 block text-sm font-medium text-gray-700"
								>Mensaje</label
							>
							<textarea
								v-model="form.message"
								id="message"
								rows="6"
								required
								class="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 transition-colors duration-300 focus:border-transparent focus:ring-2 focus:ring-blue-500"
								placeholder="Escribe tu mensaje aquí..."></textarea>
						</div>

						<button
							type="submit"
							:disabled="loading"
							class="w-full rounded-lg bg-black px-6 py-4 font-bold text-white transition-all duration-300 focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50">
							{{ loading ? "Enviando..." : "Enviar Mensaje" }}
						</button>
					</form>
				</div>

				<!-- Contact Information -->
				<div class="space-y-8">
					<!-- Contact Cards -->
					<div class="grid grid-cols-1 gap-6">
						<div
							class="rounded-xl bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl">
							<div class="flex items-start">
								<div
									class="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black text-white">
									<Icon name="fa6-solid:inbox" />
								</div>
								<div>
									<h3 class="mb-2 text-lg font-bold text-gray-900">Correo Electrónico</h3>
									<p class="mb-2 text-gray-600">Respuesta en menos de 24 horas</p>
									<a
										href="mailto:info@elitehub.com"
										class="font-medium text-black hover:text-gray-600"
										>info@elitehub.com</a
									>
								</div>
							</div>
						</div>

						<div
							class="rounded-xl bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl">
							<div class="flex items-start">
								<div
									class="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black text-white">
									<Icon name="fa6-solid:phone" />
								</div>
								<div>
									<h3 class="mb-2 text-lg font-bold text-gray-900">Teléfono</h3>
									<p class="mb-2 text-gray-600">Lunes a Viernes, 8:00 AM - 6:00 PM</p>
									<a href="tel:+5712345678" class="font-medium text-black hover:text-gray-600"
										>+57 (1) 234-5678</a
									>
								</div>
							</div>
						</div>

						<div
							class="rounded-xl bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl">
							<div class="flex items-start">
								<div
									class="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black text-white">
									<Icon name="fa6-solid:location-dot" />
								</div>
								<div>
									<h3 class="mb-2 text-lg font-bold text-gray-900">Oficina Principal</h3>
									<p class="mb-2 text-gray-600">Visítanos en nuestras instalaciones</p>
									<p class="font-medium text-black">Calle 123 #45-67<br />Cali, Colombia</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Social Media -->
					<div class="rounded-xl bg-white p-6 shadow-lg">
						<h3 class="mb-4 text-lg font-bold text-gray-900">Síguenos en Redes Sociales</h3>
						<div class="flex space-x-4">
							<a
								href="#"
								class="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors duration-300 hover:bg-gray-600">
								<Icon name="fa-brands:facebook-f" />
							</a>
							<a
								href="#"
								class="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors duration-300 hover:bg-gray-600">
								<Icon name="fa-brands:twitter" />
							</a>
							<a
								href="#"
								class="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors duration-300 hover:bg-gray-600">
								<Icon name="fa-brands:tiktok" />
							</a>
							<a
								href="#"
								class="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors duration-300 hover:bg-gray-600">
								<Icon name="fa-brands:youtube" />
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup>
	definePageMeta({
		auth: false,
		title: "Contáctanos - EliteHub",
		description: "Ponte en contacto con el equipo de EliteHub. Estamos aquí para ayudarte",
	});

	const { getContent } = useContent();

	const pageContent = ref({
		title: "",
		subtitle: "",
		content: "",
		metadata: {},
	});

	const loading = ref(false);

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
			// Here you would typically send the form data to your API
			await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

			// Reset form
			form.value = {
				firstName: "",
				lastName: "",
				email: "",
				phone: "",
				subject: "",
				message: "",
			};

			alert("¡Mensaje enviado exitosamente! Te contactaremos pronto.");
		} catch (error) {
			console.error("Error sending message:", error);
			alert("Error al enviar el mensaje. Por favor, inténtalo de nuevo.");
		} finally {
			loading.value = false;
		}
	};

	const handleContentUpdate = (updatedContent) => {
		pageContent.value = updatedContent;
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
