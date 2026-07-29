<template>
	<div class="w-full min-h-screen bg-surface-container dark:bg-surface-container-dark">
	<div class="mx-auto max-w-[120rem] px-4 py-10 sm:px-6 lg:px-8">
		<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Mensajes de Contacto</h1>

		<div v-if="loading" class="text-gray-600 dark:text-gray-300">Cargando...</div>

		<div v-else-if="mensajes.length === 0" class="text-gray-600 dark:text-gray-300">
			No hay mensajes de contacto todavía.
		</div>

		<div v-else class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-neutral-800">
			<!-- Stacked labeled cards below md -->
			<div class="divide-y divide-gray-200 dark:divide-gray-600 md:hidden">
				<div v-for="m in mensajes" :key="m.id" class="space-y-2 p-4">
					<div>
						<span class="block text-xs text-gray-500 dark:text-gray-400">Nombre</span>
						<span class="text-sm text-gray-900 dark:text-gray-100">{{ m.nombre }} {{ m.apellido }}</span>
					</div>
					<div>
						<span class="block text-xs text-gray-500 dark:text-gray-400">Correo</span>
						<span class="text-sm text-gray-900 dark:text-gray-100">{{ m.correo }}</span>
					</div>
					<div>
						<span class="block text-xs text-gray-500 dark:text-gray-400">Teléfono</span>
						<span class="text-sm text-gray-900 dark:text-gray-100">{{ m.telefono || "—" }}</span>
					</div>
					<div>
						<span class="block text-xs text-gray-500 dark:text-gray-400">Asunto</span>
						<span class="text-sm text-gray-900 dark:text-gray-100">{{ m.asunto }}</span>
					</div>
					<div>
						<span class="block text-xs text-gray-500 dark:text-gray-400">Mensaje</span>
						<span class="text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">{{ m.mensaje }}</span>
					</div>
					<div>
						<span class="block text-xs text-gray-500 dark:text-gray-400">Fecha</span>
						<span class="text-sm text-gray-900 dark:text-gray-100">{{ formatDate(m.createdAt) }}</span>
					</div>
				</div>
			</div>

			<!-- True tabular rows at md+ -->
			<table class="hidden w-full table-auto divide-y divide-gray-200 dark:divide-gray-600 md:table">
				<thead>
					<tr class="bg-gray-50 dark:bg-neutral-700">
						<th class="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Nombre</th>
						<th class="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Correo</th>
						<th class="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Teléfono</th>
						<th class="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Asunto</th>
						<th class="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Mensaje</th>
						<th class="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Fecha</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 dark:divide-gray-600">
					<tr v-for="m in mensajes" :key="m.id">
						<td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ m.nombre }} {{ m.apellido }}</td>
						<td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ m.correo }}</td>
						<td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ m.telefono || "—" }}</td>
						<td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ m.asunto }}</td>
						<td class="px-4 py-3 text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">{{ m.mensaje }}</td>
						<td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ formatDate(m.createdAt) }}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
	</div>
</template>

<script setup lang="ts">
definePageMeta({
	middleware: ["admin"],
});

const mensajes = ref<any[]>([]);
const loading = ref(true);

function formatDate(d: string) {
	return new Date(d).toLocaleString();
}

onMounted(async () => {
	try {
		mensajes.value = await $fetch("/api/mensajes-contacto");
	} catch (error) {
		console.error("Error loading mensajes de contacto:", error);
	} finally {
		loading.value = false;
	}
});
</script>
