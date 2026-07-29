<template>
	<NuxtLink
		:to="detailRoute"
		class="block overflow-hidden rounded-xl bg-surface shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl dark:bg-surface-container-dark">
		<div :class="['flex h-32 items-center justify-center', themeClass]">
			<img
				v-if="usuario.avatar"
				:src="usuario.avatar"
				class="h-20 w-20 cursor-zoom-in rounded-full border-4 border-white object-cover"
				@click.stop.prevent="showLightbox = true" />
			<div
				v-else
				class="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white text-xl font-bold text-gray-700">
				{{ initials }}
			</div>
		</div>

		<div class="p-6 text-center">
			<h3 class="mb-1 text-lg font-bold text-gray-900 dark:text-white">{{ usuario.nombre }} {{ usuario.apellido }}</h3>
			<p v-if="tagline" class="mb-3 text-sm font-semibold" :class="taglineColorClass">{{ tagline }}</p>

			<ul v-if="detailLines.length" class="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
				<li v-for="(line, i) in detailLines" :key="i" class="flex items-center justify-center gap-2">
					<Icon :name="line.icon" class="flex-shrink-0 text-gray-400 dark:text-gray-500" />
					<span class="truncate">{{ line.text }}</span>
				</li>
			</ul>
		</div>
	</NuxtLink>

	<Teleport to="body">
		<div
			v-if="showLightbox"
			class="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
			@click="showLightbox = false">
			<button
				type="button"
				class="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg"
				@click.stop="showLightbox = false">
				<Icon name="fa6-solid:xmark" />
			</button>
			<img :src="usuario.avatar" class="max-h-[80vh] max-w-full rounded-lg object-contain" @click.stop />
		</div>
	</Teleport>
</template>

<script setup>
const THEMES = {
	Deportista: {
		gradient: "bg-surface-inverse",
		text: "text-blue-600",
	},
	Marca: {
		gradient: "bg-surface-inverse",
		text: "text-orange-600",
	},
	Nutricionista: {
		gradient: "bg-surface-inverse",
		text: "text-green-600",
	},
	Patrocinador: {
		gradient: "bg-surface-inverse",
		text: "text-purple-600",
	},
};

const ROUTE_BASES = {
	Deportista: "/deportistas",
	Marca: "/marcas",
	Nutricionista: "/nutricionistas",
	Patrocinador: "/patrocinadores",
};

const props = defineProps({
	usuario: { type: Object, required: true },
});

const tipo = computed(() => props.usuario.informacion?.tipoUsuario?.tipo || "Deportista");
const theme = computed(() => THEMES[tipo.value] || THEMES.Deportista);
const themeClass = computed(() => theme.value.gradient);
const taglineColorClass = computed(() => theme.value.text);
const detailRoute = computed(() => `${ROUTE_BASES[tipo.value] || ROUTE_BASES.Deportista}/${props.usuario.id}`);
const showLightbox = ref(false);

const initials = computed(() => {
	const n = props.usuario.nombre?.charAt(0) || "";
	const a = props.usuario.apellido?.charAt(0) || "";
	return `${n}${a}`.toUpperCase();
});

function edadDesde(fecha) {
	if (!fecha) return null;
	const nacimiento = new Date(fecha);
	const hoy = new Date();
	let edad = hoy.getFullYear() - nacimiento.getFullYear();
	const m = hoy.getMonth() - nacimiento.getMonth();
	if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
	return edad;
}

const tagline = computed(() => {
	const info = props.usuario.informacion;
	if (!info) return "";
	if (tipo.value === "Deportista") {
		return props.usuario.UsuarioDeporte?.[0]?.deporte?.nombre || "";
	}
	if (tipo.value === "Nutricionista") return info.especialidad || "";
	return "";
});

const detailLines = computed(() => {
	const info = props.usuario.informacion || {};
	const deporte = props.usuario.UsuarioDeporte?.[0];
	const lines = [];

	if (tipo.value === "Deportista") {
		if (deporte?.nivel) lines.push({ icon: "fa6-solid:medal", text: deporte.nivel });
		if (info.ciudadResidencia) lines.push({ icon: "fa6-solid:location-dot", text: info.ciudadResidencia });
		const edad = edadDesde(info.fechaNacimiento);
		if (edad) lines.push({ icon: "fa6-solid:cake-candles", text: `${edad} años` });
	} else if (tipo.value === "Marca") {
		if (info.sitioWeb) lines.push({ icon: "fa6-solid:globe", text: info.sitioWeb });
		if (info.direccionContacto) lines.push({ icon: "fa6-solid:location-dot", text: info.direccionContacto });
		if (info.nombreContacto) lines.push({ icon: "fa6-solid:user", text: info.nombreContacto });
	} else if (tipo.value === "Nutricionista") {
		if (info.ciudadResidencia) lines.push({ icon: "fa6-solid:location-dot", text: info.ciudadResidencia });
		if (info.anosExperiencia) lines.push({ icon: "fa6-solid:briefcase", text: `${info.anosExperiencia} años de experiencia` });
		if (info.modalidadAtencion) lines.push({ icon: "fa6-solid:comments", text: info.modalidadAtencion });
	} else if (tipo.value === "Patrocinador") {
		if (info.ciudadResidencia) lines.push({ icon: "fa6-solid:location-dot", text: info.ciudadResidencia });
		if (info.pais) lines.push({ icon: "fa6-solid:flag", text: info.pais });
		if (info.sitioWeb) lines.push({ icon: "fa6-solid:globe", text: info.sitioWeb });
	}

	return lines;
});
</script>
