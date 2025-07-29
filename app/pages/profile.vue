<template>
	<div class="mx-auto w-full max-w-[120rem] px-4 py-10">
		<!-- Encabezado del perfil -->
		<div class="mb-8 rounded-2xl bg-white p-6 shadow-md">
			<div class="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6">
				<!-- Avatar -->
				<div class="relative h-32 w-32 overflow-hidden rounded-full border-4">
					<img
						v-if="user?.avatar"
						:src="user.avatar"
						:alt="`${user.nombre} ${user.apellido}`"
						class="h-full w-full object-cover" />
					<div v-else class="flex h-full w-full items-center justify-center text-4xl">
						{{ authStore.initials }}
					</div>
				</div>

				<!-- Información del usuario -->
				<div class="flex-1 text-center md:text-left">
					<h1 class="text-3xl font-bold text-gray-900">{{ user?.nombre }} {{ user?.apellido }}</h1>
					<p class="text-lg text-gray-600">
						{{ user?.informacion?.profesion }}
					</p>
					<div v-if="user?.informacion?.especialidad" class="mt-2">
						<span class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium">
							{{ user.informacion.especialidad }}
						</span>
					</div>
				</div>

				<!-- Acciones -->
				<div class="flex space-x-3">
					<button
						class="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white focus:outline-none">
						<Icon name="fa6-solid:pen" />
						Editar Perfil
					</button>
				</div>
			</div>
		</div>

		<!-- Secciones del perfil -->
		<div class="grid gap-4 md:grid-cols-2"></div>

		<!-- Sección de experiencia (solo visible si existe) -->
		<div v-if="user?.informacion?.experiencia" class="mt-6 rounded-2xl bg-white p-6 shadow-md">
			<h2 class="mb-4 text-xl font-semibold text-gray-900">Experiencia</h2>
			<div class="prose max-w-none text-gray-600">
				<p>{{ user.informacion.experiencia }}</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	const authStore = useAuthStore();
	const { user } = storeToRefs(authStore);
	const formUser = ref(structuredClone(user.value)); // editable


	// Función para formatear fechas
	const formatDate = (dateString: string) => {
		if (!dateString) return "No especificada";
		const date = new Date(dateString);
		return date.toLocaleDateString("es-ES", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};
</script>

<style scoped></style>
