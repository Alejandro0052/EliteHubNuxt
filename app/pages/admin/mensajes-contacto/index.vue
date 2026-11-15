<template>
	<div class="min-h-screen w-full bg-surface-container dark:bg-surface-container-dark">
		<div class="max-w-page-shell mx-auto px-4 pt-8 pb-16 sm:px-6 lg:px-8">
			<h1 class="form-title">Mensajes de contacto</h1>

			<p v-if="loading" class="text-on-surface-variant dark:text-on-surface-variant-dark">Cargando mensajes…</p>
			<p v-else-if="mensajes.length === 0" class="text-on-surface-variant dark:text-on-surface-variant-dark">Todavía no ha llegado ningún mensaje de contacto.</p>

			<template v-else>
				<!-- Tarjetas apiladas por debajo de md -->
				<ul class="space-y-4 md:hidden">
					<li v-for="m in mensajes" :key="m.id" class="p-4 rounded-lg border border-border-hairline bg-surface dark:border-border-hairline-dark dark:bg-surface-container-dark">
						<p class="font-display text-3xl leading-none font-extrabold uppercase text-on-surface dark:text-on-surface-dark">{{ m.asunto }}</p>
						<p class="mt-2 font-semibold text-on-surface dark:text-on-surface-dark">{{ m.nombre }} {{ m.apellido }}</p>
						<p class="text-sm break-words text-on-surface-variant dark:text-on-surface-variant-dark">
							{{ m.correo }}<span v-if="m.telefono">, {{ m.telefono }}</span>
						</p>
						<p class="mt-3 whitespace-pre-wrap text-on-surface dark:text-on-surface-dark">{{ m.mensaje }}</p>
						<p class="mt-3 text-sm tabular-nums text-on-surface-variant dark:text-on-surface-variant-dark">{{ formatDate(m.createdAt) }}</p>
					</li>
				</ul>

				<!-- Tabla desde md -->
				<div class="hidden overflow-x-auto md:block rounded-lg border border-border-hairline bg-surface dark:border-border-hairline-dark dark:bg-surface-container-dark">
					<table class="data-table">
						<thead>
							<tr>
								<th>Nombre</th>
								<th>Correo</th>
								<th>Teléfono</th>
								<th>Asunto</th>
								<th>Mensaje</th>
								<th>Fecha</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="m in mensajes" :key="m.id">
								<td class="font-semibold">{{ m.nombre }} {{ m.apellido }}</td>
								<td>{{ m.correo }}</td>
								<td class="whitespace-nowrap tabular-nums">{{ m.telefono || "Sin teléfono" }}</td>
								<td>{{ m.asunto }}</td>
								<td class="max-w-[50ch] whitespace-pre-wrap">{{ m.mensaje }}</td>
								<td class="text-sm whitespace-nowrap tabular-nums text-on-surface-variant dark:text-on-surface-variant-dark">{{ formatDate(m.createdAt) }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</template>
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
	return new Date(d).toLocaleString("es", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
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
