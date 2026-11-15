<template>
	<div class="min-h-screen w-full bg-surface-container dark:bg-surface-container-dark">
		<div class="max-w-page-shell mx-auto px-4 pt-8 pb-16 sm:px-6 lg:px-8">
			<h1 class="form-title">Reportes</h1>

			<p v-if="loading" class="text-on-surface-variant dark:text-on-surface-variant-dark">Cargando reportes…</p>

			<section v-else-if="items.length" class="p-6 sm:p-8 rounded-lg border border-border-hairline bg-surface dark:border-border-hairline-dark dark:bg-surface-container-dark">
				<h2 class="font-display text-4xl leading-none font-extrabold uppercase text-on-surface dark:text-on-surface-dark">Usuarios por tipo</h2>
				<p class="mt-2 max-w-[65ch] text-on-surface-variant dark:text-on-surface-variant-dark">Usuarios registrados según su tipo de perfil, calculados en tiempo real.</p>

				<div class="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
					<div class="relative mx-auto aspect-square w-full max-w-sm">
						<Doughnut :data="chartData" :options="chartOptions" />
						<div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
							<span class="font-display text-7xl leading-[0.9] font-extrabold tabular-nums text-on-surface dark:text-on-surface-dark">{{ total }}</span>
							<span class="text-sm text-on-surface-variant dark:text-on-surface-variant-dark">usuarios registrados</span>
						</div>
					</div>

					<div>
						<ul>
						<li v-for="item in items" :key="item.tipo" class="flex items-center gap-3 border-b border-border-hairline py-2.5 dark:border-border-hairline-dark">
							<span class="h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: item.color }"></span>
							<span class="flex-1 text-on-surface dark:text-on-surface-dark">{{ item.tipo }}</span>
							<span class="text-sm tabular-nums text-on-surface-variant dark:text-on-surface-variant-dark">{{ item.pct }}%</span>
							<span class="w-12 text-right font-semibold tabular-nums text-on-surface dark:text-on-surface-dark">{{ item.count }}</span>
						</li>
						</ul>
						<div class="mt-4 flex items-end justify-between gap-4">
							<span class="font-semibold text-on-surface dark:text-on-surface-dark">Total de usuarios registrados</span>
							<span class="font-display text-5xl leading-none font-extrabold tabular-nums text-primary dark:text-primary-dark">{{ total }}</span>
						</div>
					</div>
				</div>

				<p class="mt-6 border-l-4 border-primary pl-4 text-sm dark:border-primary-dark text-on-surface-variant dark:text-on-surface-variant-dark">
					Estos totales salen de la misma consulta que los contadores públicos del inicio, así que siempre coinciden.
				</p>
			</section>

			<section class="mt-8 p-6 sm:p-8 rounded-lg border border-border-hairline bg-surface dark:border-border-hairline-dark dark:bg-surface-container-dark">
				<h2 class="font-display text-4xl leading-none font-extrabold uppercase text-on-surface dark:text-on-surface-dark">Publicaciones por tipo</h2>
				<p class="mt-2 max-w-[65ch] text-on-surface-variant dark:text-on-surface-variant-dark">Publicaciones creadas según el tipo de usuario del autor. Puedes limitar el conteo a un rango de fechas.</p>

				<div class="mt-5 flex flex-wrap items-end gap-4">
					<label class="form-label flex flex-col gap-1">
						Desde
						<input v-model="desde" type="date" class="form-control font-normal" />
					</label>
					<label class="form-label flex flex-col gap-1">
						Hasta
						<input v-model="hasta" type="date" class="form-control font-normal" />
					</label>
					<button type="button" class="button-secondary px-4 py-2 font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark" @click="limpiarRango">
						Limpiar rango
					</button>
				</div>

				<p v-if="errorPublicaciones" role="alert" class="mt-4 text-sm text-destructive dark:text-destructive-dark">{{ errorPublicaciones }}</p>

				<p v-if="loadingPublicaciones" class="mt-6 text-on-surface-variant dark:text-on-surface-variant-dark">Cargando publicaciones…</p>

				<ul v-else class="mt-6">
						<li v-for="item in itemsPublicaciones" :key="item.tipo" class="flex items-center gap-3 border-b border-border-hairline py-2.5 dark:border-border-hairline-dark">
							<span class="h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: item.color }"></span>
							<span class="flex-1 text-on-surface dark:text-on-surface-dark">{{ item.tipo }}</span>
							<span class="w-12 text-right font-semibold tabular-nums text-on-surface dark:text-on-surface-dark">{{ item.count }}</span>
						</li>
				</ul>
				<div class="mt-4 flex items-end justify-between gap-4">
					<span class="font-semibold text-on-surface dark:text-on-surface-dark">Total de publicaciones</span>
					<span class="font-display text-5xl leading-none font-extrabold tabular-nums text-primary dark:text-primary-dark">{{ totalPublicaciones }}</span>
				</div>
			</section>
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
