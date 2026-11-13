<template>
	<div class="w-full min-h-screen bg-surface-container dark:bg-surface-container-dark">
	<div class="mx-auto max-w-[120rem] px-4 py-10 sm:px-6 lg:px-8">
		<h1 class="text-4xl font-bold text-gray-900 dark:text-white">Reportes</h1>
		<p class="mt-2 text-gray-600 dark:text-gray-300">
			Distribución de Usuarios registrados por tipo de usuario, calculada en tiempo real sobre la base de datos.
		</p>

		<div v-if="loading" class="mt-8 text-gray-600 dark:text-gray-300">Cargando...</div>

		<div v-else-if="items.length" class="mt-8 rounded-xl bg-white p-8 shadow-lg dark:bg-neutral-800">
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
				<div class="relative mx-auto aspect-square w-full max-w-sm">
					<Doughnut :data="chartData" :options="chartOptions" />
					<div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
						<span class="text-4xl font-bold text-gray-900 dark:text-white">{{ total }}</span>
						<span class="text-sm text-gray-500 dark:text-gray-400">usuarios registrados</span>
					</div>
				</div>

				<div>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Conteo por tipo de usuario</h2>
					<ul class="mt-4 space-y-3">
						<li v-for="item in items" :key="item.tipo" class="flex items-center gap-3">
							<span class="h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: item.color }"></span>
							<span class="flex-1 text-sm text-gray-800 dark:text-gray-200">{{ item.tipo }}</span>
							<span class="text-sm text-gray-500 dark:text-gray-400">{{ item.pct }}%</span>
							<span class="w-12 text-right text-sm font-semibold text-gray-900 dark:text-white">{{ item.count }}</span>
						</li>
					</ul>
					<div class="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-600">
						<span class="font-semibold text-gray-900 dark:text-white">Total de Usuarios registrados</span>
						<span class="text-2xl font-bold text-green-700 dark:text-green-400">{{ total }}</span>
					</div>
				</div>
			</div>

			<p class="mt-6 border-l-4 border-green-700 bg-green-50 p-4 text-sm text-gray-700 dark:border-green-500 dark:bg-neutral-700 dark:text-gray-200">
				Estos totales coinciden con los contadores públicos de la página de Inicio — misma consulta agregada.
			</p>
		</div>

		<div class="mt-8 rounded-xl bg-white p-8 shadow-lg dark:bg-neutral-800">
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Publicaciones por tipo de usuario</h2>
			<p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
				Cantidad de publicaciones creadas por tipo de usuario autor, opcionalmente filtrada por rango de fechas.
			</p>

			<div class="mt-4 flex flex-wrap items-end gap-4">
				<label class="flex flex-col text-sm text-gray-700 dark:text-gray-200">
					Desde
					<input
						v-model="desde"
						type="date"
						class="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-neutral-700 dark:text-white"
					/>
				</label>
				<label class="flex flex-col text-sm text-gray-700 dark:text-gray-200">
					Hasta
					<input
						v-model="hasta"
						type="date"
						class="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-neutral-700 dark:text-white"
					/>
				</label>
				<button
					type="button"
					class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-neutral-700"
					@click="limpiarRango"
				>
					Limpiar rango
				</button>
			</div>

			<p v-if="errorPublicaciones" class="mt-4 text-sm text-red-600 dark:text-red-400">{{ errorPublicaciones }}</p>

			<div v-if="loadingPublicaciones" class="mt-6 text-gray-600 dark:text-gray-300">Cargando...</div>

			<ul v-else class="mt-6 space-y-3">
				<li v-for="item in itemsPublicaciones" :key="item.tipo" class="flex items-center gap-3">
					<span class="h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: item.color }"></span>
					<span class="flex-1 text-sm text-gray-800 dark:text-gray-200">{{ item.tipo }}</span>
					<span class="w-12 text-right text-sm font-semibold text-gray-900 dark:text-white">{{ item.count }}</span>
				</li>
			</ul>
			<div class="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-600">
				<span class="font-semibold text-gray-900 dark:text-white">Total de Publicaciones</span>
				<span class="text-2xl font-bold text-green-700 dark:text-green-400">{{ totalPublicaciones }}</span>
			</div>
		</div>
	</div>
	</div>
</template>

<script setup>
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

definePageMeta({
	middleware: ['admin'],
})

const COLORES = ['#166534', '#15803d', '#22c55e', '#86efac']
// Color keyed by TipoUsuario itself (not by list position) so the same category
// always gets the same swatch in both report cards, even though the first report
// sorts its items by count (reordering positions) while the second doesn't.
const COLOR_POR_TIPO = {
	Deportista: COLORES[0],
	Marca: COLORES[1],
	Nutricionista: COLORES[2],
	Patrocinador: COLORES[3],
}
function colorDeTipo(tipo) {
	return COLOR_POR_TIPO[tipo] || COLORES[COLORES.length - 1]
}

const loading = ref(true)
const total = ref(0)
const items = ref([])

const chartData = computed(() => ({
	labels: items.value.map((i) => i.tipo),
	datasets: [
		{
			data: items.value.map((i) => i.count),
			backgroundColor: items.value.map((i) => i.color),
			borderWidth: 0,
		},
	],
}))

const chartOptions = {
	plugins: {
		legend: { display: false },
	},
}

onMounted(async () => {
	try {
		const res = await $fetch('/api/admin/reportes')
		total.value = res.total

		const ordenado = Object.entries(res.porTipo)
			.map(([tipo, count]) => ({ tipo, count }))
			.sort((a, b) => b.count - a.count)

		items.value = ordenado.map((item) => ({
			...item,
			pct: total.value ? Math.round((item.count / total.value) * 1000) / 10 : 0,
			color: colorDeTipo(item.tipo),
		}))
	} catch (err) {
		console.error(err)
	} finally {
		loading.value = false
	}
})

const desde = ref('')
const hasta = ref('')
const loadingPublicaciones = ref(true)
const errorPublicaciones = ref('')
const totalPublicaciones = ref(0)
const itemsPublicaciones = ref([])

// Guards against out-of-order responses: if the user changes desde/hasta again
// before an in-flight request resolves, only the response matching the LATEST
// call is allowed to update the UI -- an older, slower response arriving late
// is discarded instead of silently overwriting newer data.
let requestIdPublicaciones = 0

async function cargarPublicaciones() {
	const thisRequestId = ++requestIdPublicaciones
	loadingPublicaciones.value = true
	errorPublicaciones.value = ''
	try {
		const res = await $fetch('/api/admin/reportes/publicaciones', {
			query: {
				...(desde.value && { desde: desde.value }),
				...(hasta.value && { hasta: hasta.value }),
			},
		})
		if (thisRequestId !== requestIdPublicaciones) return

		totalPublicaciones.value = res.total
		itemsPublicaciones.value = Object.entries(res.porTipo).map(([tipo, count]) => ({
			tipo,
			count,
			color: colorDeTipo(tipo),
		}))
	} catch (err) {
		if (thisRequestId !== requestIdPublicaciones) return

		// Clear stale counts so the error message isn't shown alongside a previous
		// successful result that no longer corresponds to the current filter.
		itemsPublicaciones.value = []
		totalPublicaciones.value = 0
		errorPublicaciones.value = err?.data?.message || 'No se pudo cargar el reporte de publicaciones.'
	} finally {
		if (thisRequestId === requestIdPublicaciones) {
			loadingPublicaciones.value = false
		}
	}
}

function limpiarRango() {
	desde.value = ''
	hasta.value = ''
}

watch([desde, hasta], cargarPublicaciones)

onMounted(cargarPublicaciones)
</script>
