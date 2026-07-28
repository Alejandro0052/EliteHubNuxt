<template>
	<div class="mx-auto min-h-screen max-w-[120rem] bg-white px-4 py-10 sm:px-6 lg:px-8">
		<h1 class="text-4xl font-bold text-gray-900">Reportes</h1>
		<p class="mt-2 text-gray-600">
			Distribución de Usuarios registrados por tipo de usuario, calculada en tiempo real sobre la base de datos.
		</p>

		<div v-if="loading" class="mt-8 text-gray-600">Cargando...</div>

		<div v-else-if="items.length" class="mt-8 rounded-xl bg-white p-8 shadow-lg">
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
				<div class="relative mx-auto aspect-square w-full max-w-sm">
					<Doughnut :data="chartData" :options="chartOptions" />
					<div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
						<span class="text-4xl font-bold text-gray-900">{{ total }}</span>
						<span class="text-sm text-gray-500">usuarios registrados</span>
					</div>
				</div>

				<div>
					<h2 class="text-lg font-semibold text-gray-900">Conteo por tipo de usuario</h2>
					<ul class="mt-4 space-y-3">
						<li v-for="item in items" :key="item.tipo" class="flex items-center gap-3">
							<span class="h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: item.color }"></span>
							<span class="flex-1 text-sm text-gray-800">{{ item.tipo }}</span>
							<span class="text-sm text-gray-500">{{ item.pct }}%</span>
							<span class="w-12 text-right text-sm font-semibold text-gray-900">{{ item.count }}</span>
						</li>
					</ul>
					<div class="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
						<span class="font-semibold text-gray-900">Total de Usuarios registrados</span>
						<span class="text-2xl font-bold text-green-700">{{ total }}</span>
					</div>
				</div>
			</div>

			<p class="mt-6 border-l-4 border-green-700 bg-green-50 p-4 text-sm text-gray-700">
				Estos totales coinciden con los contadores públicos de la página de Inicio — misma consulta agregada.
			</p>
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

		items.value = ordenado.map((item, i) => ({
			...item,
			pct: total.value ? Math.round((item.count / total.value) * 1000) / 10 : 0,
			color: COLORES[i] || COLORES[COLORES.length - 1],
		}))
	} catch (err) {
		console.error(err)
	} finally {
		loading.value = false
	}
})
</script>
