<template>
	<form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
			<div class="flex flex-col gap-1">
				<label class="text-sm font-medium text-gray-700">Tipo de usuario</label>
				<p class="rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-700">
					{{ tipo || "Sin tipo asignado" }}
				</p>
			</div>
			<div class="flex flex-col gap-1">
				<label for="correo" class="text-sm font-medium text-gray-700">Correo</label>
				<input id="correo" v-model="form.correo" type="email" required class="reg-input" />
			</div>
		</div>

		<!-- Avatar -->
		<div class="flex flex-col items-start gap-2">
			<label for="avatarFile" class="text-sm font-medium text-gray-700">Foto de perfil</label>
			<div class="flex items-center gap-4">
				<img v-if="avatarPreview" :src="avatarPreview" alt="Avatar" class="h-16 w-16 rounded-full border object-cover" />
				<span v-else class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-400">
					<Icon name="fa6-solid:user" class="text-2xl" />
				</span>
				<input id="avatarFile" type="file" accept="image/*" class="text-sm" @change="handleAvatarUpload" />
			</div>
			<p v-if="avatarError" class="text-xs text-red-500">{{ avatarError }}</p>
		</div>

		<!-- Deportista -->
		<template v-if="tipo === 'Deportista'">
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div class="flex flex-col gap-1">
					<label for="nombre" class="text-sm font-medium text-gray-700">Primer nombre</label>
					<input id="nombre" v-model="form.nombre" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="segundoNombre" class="text-sm font-medium text-gray-700">Segundo nombre</label>
					<input id="segundoNombre" v-model="form.informacion.segundoNombre" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="apellido" class="text-sm font-medium text-gray-700">Primer apellido</label>
					<input id="apellido" v-model="form.apellido" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="segundoApellido" class="text-sm font-medium text-gray-700">Segundo apellido</label>
					<input id="segundoApellido" v-model="form.informacion.segundoApellido" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="fechaNacimiento" class="text-sm font-medium text-gray-700">Fecha de nacimiento</label>
					<input id="fechaNacimiento" v-model="form.informacion.fechaNacimiento" type="date" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="genero" class="text-sm font-medium text-gray-700">Género</label>
					<select id="genero" v-model="form.informacion.genero" class="reg-input">
						<option value="">Selecciona…</option>
						<option v-for="g in GENEROS" :key="g" :value="g">{{ g }}</option>
					</select>
				</div>
				<div class="flex flex-col gap-1">
					<label for="nacionalidad" class="text-sm font-medium text-gray-700">Nacionalidad</label>
					<select id="nacionalidad" v-model="form.informacion.nacionalidad" class="reg-input">
						<option value="">Selecciona…</option>
						<option v-for="p in PAISES" :key="p" :value="p">{{ p }}</option>
					</select>
				</div>
				<div class="flex flex-col gap-1">
					<label for="ciudadResidencia" class="text-sm font-medium text-gray-700">Ciudad de residencia</label>
					<input id="ciudadResidencia" v-model="form.informacion.ciudadResidencia" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="telefono" class="text-sm font-medium text-gray-700">Teléfono</label>
					<input id="telefono" v-model="form.informacion.telefono" type="tel" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1 sm:col-span-2">
					<label for="bio" class="text-sm font-medium text-gray-700">Biografía corta</label>
					<textarea id="bio" v-model="form.informacion.bio" rows="2" class="reg-input resize-none"></textarea>
				</div>
				<div class="flex flex-col gap-1">
					<label for="deporteId" class="text-sm font-medium text-gray-700">Deporte</label>
					<select id="deporteId" v-model="form.deporte.deporteId" class="reg-input">
						<option :value="null">Selecciona…</option>
						<option v-for="d in deportes" :key="d.id" :value="d.id">{{ d.nombre }}</option>
					</select>
				</div>
				<div class="flex flex-col gap-1">
					<label for="nivel" class="text-sm font-medium text-gray-700">Nivel deportivo</label>
					<select id="nivel" v-model="form.deporte.nivel" class="reg-input">
						<option value="">Selecciona…</option>
						<option v-for="n in NIVELES" :key="n" :value="n">{{ n }}</option>
					</select>
				</div>
				<div class="flex flex-col gap-1">
					<label for="altura" class="text-sm font-medium text-gray-700">Altura (m)</label>
					<input id="altura" v-model="form.informacion.altura" type="number" step="0.01" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="peso" class="text-sm font-medium text-gray-700">Peso (kg)</label>
					<input id="peso" v-model="form.informacion.peso" type="number" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="experiencia" class="text-sm font-medium text-gray-700">Años de experiencia en el deporte</label>
					<input id="experiencia" v-model="form.deporte.experiencia" type="number" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="redSocialUrl" class="text-sm font-medium text-gray-700">Link de redes sociales</label>
					<input id="redSocialUrl" v-model="form.redSocialUrl" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1 sm:col-span-2">
					<label for="objetivosActuales" class="text-sm font-medium text-gray-700">Objetivos actuales</label>
					<textarea id="objetivosActuales" v-model="form.informacion.objetivosActuales" rows="2" class="reg-input resize-none"></textarea>
				</div>
				<div class="flex flex-col gap-1">
					<label for="marcasPersonales" class="text-sm font-medium text-gray-700">Marcas personales</label>
					<input id="marcasPersonales" v-model="form.informacion.marcasPersonales" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="lesiones" class="text-sm font-medium text-gray-700">Lesiones</label>
					<input id="lesiones" v-model="form.informacion.lesiones" type="text" class="reg-input" />
				</div>
			</div>
		</template>

		<!-- Marca -->
		<template v-else-if="tipo === 'Marca'">
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div class="flex flex-col gap-1">
					<label for="nombreComercial" class="text-sm font-medium text-gray-700">Nombre de la empresa</label>
					<input id="nombreComercial" v-model="form.nombre" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="nit" class="text-sm font-medium text-gray-700">NIT</label>
					<input id="nit" v-model="form.informacion.nit" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="telefonoMarca" class="text-sm font-medium text-gray-700">Teléfono de contacto</label>
					<input id="telefonoMarca" v-model="form.informacion.telefono" type="tel" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="direccionContacto" class="text-sm font-medium text-gray-700">Dirección</label>
					<input id="direccionContacto" v-model="form.informacion.direccionContacto" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="nombreContacto" class="text-sm font-medium text-gray-700">Nombre del contacto</label>
					<input id="nombreContacto" v-model="form.informacion.nombreContacto" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="cargoContacto" class="text-sm font-medium text-gray-700">Cargo del contacto</label>
					<input id="cargoContacto" v-model="form.informacion.cargoContacto" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="redSocialUrlMarca" class="text-sm font-medium text-gray-700">URL de red social</label>
					<input id="redSocialUrlMarca" v-model="form.redSocialUrl" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="sitioWebMarca" class="text-sm font-medium text-gray-700">URL del aplicativo web</label>
					<input id="sitioWebMarca" v-model="form.informacion.sitioWeb" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1 sm:col-span-2">
					<label for="bioMarca" class="text-sm font-medium text-gray-700">Descripción de la empresa</label>
					<textarea id="bioMarca" v-model="form.informacion.bio" rows="2" class="reg-input resize-none"></textarea>
				</div>
			</div>
		</template>

		<!-- Nutricionista -->
		<template v-else-if="tipo === 'Nutricionista'">
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div class="flex flex-col gap-1">
					<label for="nombresNutri" class="text-sm font-medium text-gray-700">Nombres</label>
					<input id="nombresNutri" v-model="form.nombre" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="apellidosNutri" class="text-sm font-medium text-gray-700">Apellidos</label>
					<input id="apellidosNutri" v-model="form.apellido" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="fechaNacimientoNutri" class="text-sm font-medium text-gray-700">Fecha de nacimiento</label>
					<input id="fechaNacimientoNutri" v-model="form.informacion.fechaNacimiento" type="date" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="generoNutri" class="text-sm font-medium text-gray-700">Género</label>
					<select id="generoNutri" v-model="form.informacion.genero" class="reg-input">
						<option value="">Selecciona…</option>
						<option v-for="g in GENEROS" :key="g" :value="g">{{ g }}</option>
					</select>
				</div>
				<div class="flex flex-col gap-1">
					<label for="telefonoNutri" class="text-sm font-medium text-gray-700">Teléfono</label>
					<input id="telefonoNutri" v-model="form.informacion.telefono" type="tel" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="paisNutri" class="text-sm font-medium text-gray-700">País</label>
					<select id="paisNutri" v-model="form.informacion.pais" class="reg-input">
						<option value="">Selecciona…</option>
						<option v-for="p in PAISES" :key="p" :value="p">{{ p }}</option>
					</select>
				</div>
				<div class="flex flex-col gap-1">
					<label for="ciudadNutri" class="text-sm font-medium text-gray-700">Ciudad de residencia</label>
					<input id="ciudadNutri" v-model="form.informacion.ciudadResidencia" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1 sm:col-span-2">
					<label for="bioNutri" class="text-sm font-medium text-gray-700">Descripción corta</label>
					<textarea id="bioNutri" v-model="form.informacion.bio" rows="2" class="reg-input resize-none"></textarea>
				</div>
				<div class="flex flex-col gap-1">
					<label for="profesion" class="text-sm font-medium text-gray-700">Título profesional</label>
					<input id="profesion" v-model="form.informacion.profesion" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="universidad" class="text-sm font-medium text-gray-700">Universidad donde estudió</label>
					<input id="universidad" v-model="form.informacion.universidad" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="anoGraduacion" class="text-sm font-medium text-gray-700">Año de graduación</label>
					<input id="anoGraduacion" v-model="form.informacion.anoGraduacion" type="number" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="especialidad" class="text-sm font-medium text-gray-700">Especialidad</label>
					<input id="especialidad" v-model="form.informacion.especialidad" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="anosExperiencia" class="text-sm font-medium text-gray-700">Años de experiencia</label>
					<input id="anosExperiencia" v-model="form.informacion.anosExperiencia" type="number" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="modalidadAtencion" class="text-sm font-medium text-gray-700">Modalidad de atención</label>
					<select id="modalidadAtencion" v-model="form.informacion.modalidadAtencion" class="reg-input">
						<option value="">Selecciona…</option>
						<option v-for="m in MODALIDADES" :key="m" :value="m">{{ m }}</option>
					</select>
				</div>
				<div class="flex flex-col gap-1">
					<label for="certificadosAdicionales" class="text-sm font-medium text-gray-700">Certificados adicionales</label>
					<input id="certificadosAdicionales" v-model="form.informacion.certificadosAdicionales" type="text" class="reg-input" />
				</div>
			</div>
		</template>

		<!-- Patrocinador -->
		<template v-else-if="tipo === 'Patrocinador'">
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div class="flex flex-col gap-1">
					<label for="nombresPatro" class="text-sm font-medium text-gray-700">Nombres</label>
					<input id="nombresPatro" v-model="form.nombre" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="apellidosPatro" class="text-sm font-medium text-gray-700">Apellidos</label>
					<input id="apellidosPatro" v-model="form.apellido" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="fechaNacimientoPatro" class="text-sm font-medium text-gray-700">Fecha de nacimiento</label>
					<input id="fechaNacimientoPatro" v-model="form.informacion.fechaNacimiento" type="date" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="telefonoPatro" class="text-sm font-medium text-gray-700">Teléfono</label>
					<input id="telefonoPatro" v-model="form.informacion.telefono" type="tel" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="paisPatro" class="text-sm font-medium text-gray-700">País</label>
					<select id="paisPatro" v-model="form.informacion.pais" class="reg-input">
						<option value="">Selecciona…</option>
						<option v-for="p in PAISES" :key="p" :value="p">{{ p }}</option>
					</select>
				</div>
				<div class="flex flex-col gap-1">
					<label for="ciudadPatro" class="text-sm font-medium text-gray-700">Ciudad</label>
					<input id="ciudadPatro" v-model="form.informacion.ciudadResidencia" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1">
					<label for="sitioWebPatro" class="text-sm font-medium text-gray-700">Sitio web</label>
					<input id="sitioWebPatro" v-model="form.informacion.sitioWeb" type="text" class="reg-input" />
				</div>
				<div class="flex flex-col gap-1 sm:col-span-2">
					<label for="bioPatro" class="text-sm font-medium text-gray-700">Descripción breve</label>
					<textarea id="bioPatro" v-model="form.informacion.bio" rows="2" class="reg-input resize-none"></textarea>
				</div>
			</div>
		</template>

		<div class="flex justify-end gap-4">
			<button
				type="submit"
				:disabled="submitting"
				class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
				{{ submitting ? "Guardando..." : "Guardar cambios" }}
			</button>
		</div>
	</form>
</template>

<script lang="ts" setup>
import { GENEROS, PAISES } from "#shared/utils/fixedLists";

const NIVELES = ["PRINCIPIANTE", "INTERMEDIO", "AVANZADO", "PROFESIONAL"];
// NOTA: los valores reales del enum Prisma ModalidadAtencion son PRESENCIAL/VIRTUAL/HIBRIDO.
// register.vue actualmente usa "VIRTUAL/PRESENCIAL" en vez de "HIBRIDO" (bug pre-existente de la
// Historia 1.1, fuera de alcance aquí) — este formulario usa los valores correctos del enum.
const MODALIDADES = ["PRESENCIAL", "VIRTUAL", "HIBRIDO"];

const props = defineProps<{
	usuario: any;
	submitting?: boolean;
}>();

const emit = defineEmits<{ submit: [payload: Record<string, any>] }>();

const deportes = ref<{ id: number; nombre: string }[]>([]);
onMounted(async () => {
	try {
		deportes.value = await $fetch("/api/deportes");
	} catch (e) {
		console.error("Error cargando deportes:", e);
	}
});

const tipo = computed(() => props.usuario?.informacion?.tipoUsuario?.tipo || "");

function toDateInput(d: string | null | undefined) {
	return d ? new Date(d).toISOString().split("T")[0] : "";
}

function buildForm() {
	const u = props.usuario || {};
	const info = u.informacion || {};
	const deporte = u.UsuarioDeporte?.[0];
	const redSocial = info.redesSociales?.[0];

	return {
		nombre: u.nombre || "",
		apellido: u.apellido || "",
		correo: u.correo || "",
		informacion: {
			segundoNombre: info.segundoNombre || "",
			segundoApellido: info.segundoApellido || "",
			fechaNacimiento: toDateInput(info.fechaNacimiento),
			genero: info.genero || "",
			nacionalidad: info.nacionalidad || "",
			ciudadResidencia: info.ciudadResidencia || "",
			telefono: info.telefono || "",
			bio: info.bio || "",
			altura: info.altura ?? "",
			peso: info.peso ?? "",
			objetivosActuales: info.objetivosActuales || "",
			marcasPersonales: info.marcasPersonales || "",
			lesiones: info.lesiones || "",
			nit: info.nit || "",
			direccionContacto: info.direccionContacto || "",
			nombreContacto: info.nombreContacto || "",
			cargoContacto: info.cargoContacto || "",
			sitioWeb: info.sitioWeb || "",
			pais: info.pais || "",
			profesion: info.profesion || "",
			universidad: info.universidad || "",
			anoGraduacion: info.anoGraduacion ?? "",
			especialidad: info.especialidad || "",
			anosExperiencia: info.anosExperiencia ?? "",
			modalidadAtencion: info.modalidadAtencion || "",
			certificadosAdicionales: info.certificadosAdicionales || "",
		} as Record<string, any>,
		deporte: {
			deporteId: deporte?.deporteId ?? null,
			nivel: deporte?.nivel || "",
			experiencia: deporte?.experiencia ?? "",
		},
		redSocialUrl: redSocial?.url || "",
	};
}

const form = reactive(buildForm());

watch(
	() => props.usuario,
	() => Object.assign(form, buildForm()),
);

const avatarFile = ref<File | null>(null);
const avatarPreview = ref<string | null>(null);
const avatarError = ref<string | null>(null);

watch(
	() => props.usuario?.avatar,
	(avatar) => {
		avatarPreview.value = avatar || null;
	},
	{ immediate: true },
);

function handleAvatarUpload(event: Event) {
	avatarError.value = null;
	const target = event.target as HTMLInputElement;
	if (target.files && target.files[0]) {
		const file = target.files[0];
		if (!file.type.startsWith("image/")) {
			avatarError.value = "Solo se permiten imágenes.";
			return;
		}
		if (file.size > 2 * 1024 * 1024) {
			avatarError.value = "La imagen no debe superar los 2MB.";
			return;
		}
		avatarFile.value = file;
		avatarPreview.value = URL.createObjectURL(file);
	}
}

async function handleSubmit() {
	let avatar = props.usuario?.avatar || null;

	if (avatarFile.value) {
		const fd = new FormData();
		fd.append("avatar", avatarFile.value);
		const upload = await $fetch("/api/profile/avatar", { method: "POST", body: fd });
		avatar = upload.url;
	}

	emit("submit", {
		nombre: form.nombre,
		apellido: form.apellido,
		correo: form.correo,
		avatar,
		informacion: form.informacion,
		deporte: tipo.value === "Deportista" ? form.deporte : undefined,
		redSocialUrl: form.redSocialUrl || undefined,
	});
}
</script>

<style scoped>
.reg-input {
	border-radius: 0.375rem;
	border: 1px solid #d1d5db;
	background: #ffffff;
	padding: 0.5rem 0.75rem;
	font-size: 0.875rem;
	color: #111827;
}
</style>
