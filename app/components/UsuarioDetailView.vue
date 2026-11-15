<template>
	<div class="mx-auto max-w-5xl">
		<div class="grid gap-6 sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-8 md:grid-cols-[minmax(0,20rem)_1fr]">
			<!-- La ficha: foto a sangre o iniciales, sobre negro en ambos temas -->
			<div class="relative mx-auto flex aspect-[4/5] w-full max-w-xs items-end overflow-hidden rounded-lg bg-black text-white sm:mx-0 sm:max-w-none">
				<img
					v-if="usuario.avatar"
					:src="usuario.avatar"
					:alt="`Foto de ${usuario.nombre} ${usuario.apellido}`"
					class="absolute inset-0 h-full w-full object-cover" />
				<span v-else aria-hidden="true" class="px-5 pb-3 font-display text-[10rem] leading-[0.9] font-extrabold uppercase">
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
					@click="showLightbox = true">
					<Icon name="fa6-solid:magnifying-glass-plus" />
				</button>
			</div>

			<div class="min-w-0">
				<h1
					class="font-display text-5xl leading-[0.9] font-extrabold break-words text-on-surface uppercase sm:text-6xl lg:text-7xl dark:text-on-surface-dark">
					{{ usuario.nombre }} {{ usuario.apellido }}
				</h1>
				<p class="mt-3 border-b-2 border-on-surface pb-4 text-lg font-semibold dark:border-on-surface-dark">
					<span class="text-primary dark:text-primary-dark">{{ destacado || tipo }}</span>
					<span v-if="destacado" class="font-normal text-on-surface-variant dark:text-on-surface-variant-dark">, {{ tipo.toLowerCase() }}</span>
				</p>

				<p v-if="bio" class="mt-5 max-w-[65ch] whitespace-pre-line text-on-surface dark:text-on-surface-dark">{{ bio }}</p>

				<dl class="mt-6 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
					<div
						v-for="field in datos"
						:key="field.label"
						class="flex items-baseline justify-between gap-4 border-b border-border-hairline py-2.5 dark:border-border-hairline-dark">
						<dt class="shrink-0 text-sm text-on-surface-variant dark:text-on-surface-variant-dark">{{ field.label }}</dt>
						<dd class="min-w-0 text-right font-semibold break-words text-on-surface tabular-nums dark:text-on-surface-dark">
							{{ field.value }}
						</dd>
					</div>
				</dl>
			</div>
		</div>

		<ResenasSection v-if="tipo === 'Nutricionista'" :nutricionista-id="usuario.id" :nutricionista-nombre="usuario.nombre" />
	</div>

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
const props = defineProps({
	usuario: { type: Object, required: true },
});

const tipo = computed(() => props.usuario.informacion?.tipoUsuario?.tipo || "");
const showLightbox = ref(false);

const initials = computed(() => {
	const n = props.usuario.nombre?.charAt(0) || "";
	const a = props.usuario.apellido?.charAt(0) || "";
	return `${n}${a}`.toUpperCase();
});

function formatDate(d) {
	if (!d) return null;
	return new Date(d).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });
}

const fields = computed(() => {
	const info = props.usuario.informacion || {};
	const deporte = props.usuario.UsuarioDeporte?.[0];
	const redSocial = info.redesSociales?.[0];
	const list = [];

	const add = (label, value) => {
		if (value === null || value === undefined || value === "") return;
		list.push({ label, value });
	};

	add("Correo", props.usuario.correo);

	if (tipo.value === "Deportista") {
		add("Segundo nombre", info.segundoNombre);
		add("Segundo apellido", info.segundoApellido);
		add("Fecha de nacimiento", formatDate(info.fechaNacimiento));
		add("Género", info.genero);
		add("Nacionalidad", info.nacionalidad);
		add("Ciudad de residencia", info.ciudadResidencia);
		add("Bio", info.bio);
		add("Altura (m)", info.altura);
		add("Peso (kg)", info.peso);
		add("Deporte", deporte?.deporte?.nombre);
		add("Nivel", deporte?.nivel);
		add("Experiencia (años)", deporte?.experiencia);
		add("Objetivos actuales", info.objetivosActuales);
		add("Marcas personales", info.marcasPersonales);
		add("Lesiones", info.lesiones);
		add("Red social", redSocial?.url);
	} else if (tipo.value === "Marca") {
		add("NIT", info.nit);
		add("Teléfono", info.telefono);
		add("Dirección de contacto", info.direccionContacto);
		add("Nombre de contacto", info.nombreContacto);
		add("Cargo de contacto", info.cargoContacto);
		add("Bio", info.bio);
		add("Sitio web", info.sitioWeb);
		add("Red social", redSocial?.url);
	} else if (tipo.value === "Nutricionista") {
		add("Fecha de nacimiento", formatDate(info.fechaNacimiento));
		add("Género", info.genero);
		add("Teléfono", info.telefono);
		add("País", info.pais);
		add("Ciudad de residencia", info.ciudadResidencia);
		add("Bio", info.bio);
		add("Profesión", info.profesion);
		add("Universidad", info.universidad);
		add("Año de graduación", info.anoGraduacion);
		add("Especialidad", info.especialidad);
		add("Años de experiencia", info.anosExperiencia);
		add("Modalidad de atención", info.modalidadAtencion);
		add("Certificados adicionales", info.certificadosAdicionales);
	} else if (tipo.value === "Patrocinador") {
		add("Fecha de nacimiento", formatDate(info.fechaNacimiento));
		add("Teléfono", info.telefono);
		add("País", info.pais);
		add("Ciudad de residencia", info.ciudadResidencia);
		add("Bio", info.bio);
		add("Sitio web", info.sitioWeb);
	}

	return list;
});

// Lo que va destacado en el encabezado no se repite en la tabla de datos.
const nivel = computed(() => (tipo.value === "Deportista" ? props.usuario.UsuarioDeporte?.[0]?.nivel || "" : ""));
const destacado = computed(() => {
	if (tipo.value === "Deportista") return props.usuario.UsuarioDeporte?.[0]?.deporte?.nombre || "";
	if (tipo.value === "Nutricionista") return props.usuario.informacion?.especialidad || "";
	return "";
});
const bio = computed(() => props.usuario.informacion?.bio || "");
const OMITIDOS = ["Bio", "Nivel", "Deporte", "Especialidad"];
const datos = computed(() => fields.value.filter((f) => !OMITIDOS.includes(f.label)));
</script>
