<template>
	<div class="mx-auto max-w-3xl">
		<div class="mb-8 flex flex-col items-center gap-4 sm:flex-row">
			<img
				v-if="usuario.avatar"
				:src="usuario.avatar"
				class="h-24 w-24 cursor-zoom-in rounded-full object-cover"
				@click="showLightbox = true" />
			<div
				v-else
				class="flex h-24 w-24 items-center justify-center rounded-full border-2 border-gray-300 text-2xl font-semibold text-gray-700">
				{{ initials }}
			</div>
			<div class="text-center sm:text-left">
				<h1 class="text-3xl font-bold text-gray-900">{{ usuario.nombre }} {{ usuario.apellido }}</h1>
				<p class="text-gray-600">{{ tipo }}</p>
			</div>
		</div>

		<dl class="grid grid-cols-1 gap-x-8 gap-y-4 rounded-xl bg-white p-8 shadow-lg sm:grid-cols-2">
			<div v-for="field in fields" :key="field.label" class="flex flex-col">
				<dt class="text-xs font-semibold tracking-wide text-gray-500 uppercase">{{ field.label }}</dt>
				<dd class="text-sm text-gray-900">{{ field.value }}</dd>
			</div>
		</dl>

		<ResenasSection v-if="tipo === 'Nutricionista'" :nutricionista-id="usuario.id" :nutricionista-nombre="usuario.nombre" />
	</div>

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
	return new Date(d).toLocaleDateString();
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
</script>
