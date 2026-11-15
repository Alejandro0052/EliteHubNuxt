<template>
	<NuxtLink
		:to="detailRoute"
		class="card-lift group block overflow-hidden rounded-lg border border-border-hairline bg-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:border-border-hairline-dark dark:bg-surface-container-dark dark:focus-visible:outline-primary-dark">
		<!-- La ficha: foto a sangre o, si no hay, las iniciales en grande. Siempre sobre negro en ambos temas. -->
		<div class="relative flex aspect-[4/5] items-end bg-black text-white">
			<img
				v-if="usuario.avatar"
				:src="usuario.avatar"
				:alt="`Foto de ${usuario.nombre} ${usuario.apellido}`"
				class="absolute inset-0 h-full w-full object-cover" />
			<span v-else aria-hidden="true" class="px-4 pb-2 font-display text-9xl leading-[0.9] font-extrabold uppercase">
				{{ initials }}
			</span>

			<span
				v-if="nivel"
				class="absolute top-3 left-4 rounded-sm bg-dorsal px-2 py-0.5 text-[0.8125rem] font-semibold text-on-dorsal">
				{{ nivel }}
			</span>

			<button
				v-if="usuario.avatar"
				type="button"
				aria-label="Ampliar foto"
				class="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
				@click.stop.prevent="showLightbox = true">
				<Icon name="fa6-solid:magnifying-glass-plus" />
			</button>
		</div>

		<div
			class="border-t-4 border-transparent px-4 pt-3.5 pb-4 transition-colors duration-150 group-hover:border-primary group-focus-visible:border-primary motion-reduce:transition-none dark:group-hover:border-primary-dark dark:group-focus-visible:border-primary-dark">
			<h3 class="font-display text-[1.75rem] leading-[0.95] font-extrabold text-on-surface uppercase dark:text-on-surface-dark">
				{{ usuario.nombre }} {{ usuario.apellido }}
			</h3>
			<p v-if="tagline" class="mt-1.5 font-semibold text-primary dark:text-primary-dark">{{ tagline }}</p>

			<ul
				v-if="detailLines.length"
				class="mt-1 space-y-1 text-sm text-on-surface-variant tabular-nums dark:text-on-surface-variant-dark">
				<li v-for="(line, i) in detailLines" :key="i" class="flex items-center gap-2">
					<Icon :name="line.icon" class="flex-shrink-0 opacity-60" />
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
				aria-label="Cerrar foto"
				class="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-lg"
				@click.stop="showLightbox = false">
				<Icon name="fa6-solid:xmark" />
			</button>
			<img :src="usuario.avatar" :alt="`Foto de ${usuario.nombre} ${usuario.apellido}`" class="max-h-[80vh] max-w-full rounded-lg object-contain" @click.stop />
		</div>
	</Teleport>
</template>

<script setup>
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

// El nivel va como etiqueta sobre la ficha, no en la lista de detalles.
const nivel = computed(() => (tipo.value === "Deportista" ? props.usuario.UsuarioDeporte?.[0]?.nivel || "" : ""));

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
