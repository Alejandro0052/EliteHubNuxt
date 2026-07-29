<template>
	<div class="mx-auto h-full max-w-[120rem] p-6">
		<div
			class="grid min-h-[600px] grid-cols-1 overflow-hidden rounded-xl shadow-xl lg:grid-cols-[1.35fr_1fr]">
			<!-- Panel de formulario -->
			<div class="flex flex-col gap-4 bg-black px-6 py-8 text-white">
				<h1 class="text-2xl font-bold">Crea tu cuenta</h1>
				<p class="text-sm text-gray-300">
					Selecciona tu tipo de perfil para continuar. Los campos cambian según el tipo elegido.
				</p>

				<div class="flex flex-wrap gap-3" role="group" aria-label="Tipo de usuario">
					<button
						v-for="tipo in tiposUsuario"
						:key="tipo.id"
						type="button"
						:aria-pressed="form.tipoUsuarioId === tipo.id"
						class="rounded-lg border px-4 py-2 text-sm font-medium"
						:class="
							form.tipoUsuarioId === tipo.id
								? 'border-green-700 bg-green-700 font-bold text-white'
								: 'border-white bg-transparent text-white'
						"
						@click="selectTipo(tipo)">
						{{ tipo.tipo }}
					</button>
				</div>

				<form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
					<!-- Datos de acceso (todos los tipos) -->
					<div>
						<div class="mb-3 text-xs font-bold tracking-wider text-green-400 uppercase">Datos de acceso</div>
						<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div class="flex flex-col gap-1">
								<label for="correo" class="text-sm font-medium text-neutral-100">Correo electrónico</label>
								<input
									id="correo"
									v-model="form.correo"
									type="email"
									required
									class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900" />
							</div>
							<div class="flex flex-col gap-1">
								<label for="password" class="text-sm font-medium text-neutral-100">Contraseña</label>
								<input
									id="password"
									v-model="form.password"
									type="password"
									required
									placeholder="Mínimo 8 caracteres"
									class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900" />
							</div>
						</div>
					</div>

					<!-- Deportista -->
					<template v-if="tipoSeleccionado === 'Deportista'">
						<div>
							<div class="mb-3 text-xs font-bold tracking-wider text-green-400 uppercase">Datos personales</div>
							<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div class="flex flex-col gap-1">
									<label for="primerNombre" class="text-sm font-medium text-neutral-100">Primer nombre</label>
									<input id="primerNombre" v-model="form.primerNombre" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="segundoNombre" class="text-sm font-medium text-neutral-100">Segundo nombre</label>
									<input id="segundoNombre" v-model="form.segundoNombre" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="primerApellido" class="text-sm font-medium text-neutral-100">Primer apellido</label>
									<input id="primerApellido" v-model="form.primerApellido" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="segundoApellido" class="text-sm font-medium text-neutral-100">Segundo apellido</label>
									<input id="segundoApellido" v-model="form.segundoApellido" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="fechaNacimiento" class="text-sm font-medium text-neutral-100">Fecha de nacimiento</label>
									<input id="fechaNacimiento" v-model="form.fechaNacimiento" type="date" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="genero" class="text-sm font-medium text-neutral-100">Género</label>
									<select id="genero" v-model="form.genero" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="g in GENEROS" :key="g" :value="g">{{ g }}</option>
									</select>
								</div>
								<div class="flex flex-col gap-1">
									<label for="nacionalidad" class="text-sm font-medium text-neutral-100">Nacionalidad</label>
									<select id="nacionalidad" v-model="form.nacionalidad" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="p in PAISES" :key="p" :value="p">{{ p }}</option>
									</select>
								</div>
								<div class="flex flex-col gap-1">
									<label for="ciudadResidencia" class="text-sm font-medium text-neutral-100">Ciudad de residencia</label>
									<input id="ciudadResidencia" v-model="form.ciudadResidencia" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="telefono" class="text-sm font-medium text-neutral-100"
										>Teléfono <span class="text-neutral-400">(opcional)</span></label
									>
									<input id="telefono" v-model="form.telefono" type="tel" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1 sm:col-span-2">
									<label for="bio" class="text-sm font-medium text-neutral-100">Biografía corta</label>
									<textarea id="bio" v-model="form.bio" rows="2" class="reg-input resize-none"></textarea>
								</div>
							</div>
						</div>
						<div>
							<div class="mb-3 text-xs font-bold tracking-wider text-green-400 uppercase">Perfil deportivo</div>
							<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div class="flex flex-col gap-1">
									<label for="deporteId" class="text-sm font-medium text-neutral-100">Deporte</label>
									<select id="deporteId" v-model="form.deporteId" class="reg-input">
										<option :value="null">Selecciona…</option>
										<option v-for="d in deportes" :key="d.id" :value="d.id">{{ d.nombre }}</option>
									</select>
								</div>
								<div class="flex flex-col gap-1">
									<label for="nivel" class="text-sm font-medium text-neutral-100">Nivel deportivo</label>
									<select id="nivel" v-model="form.nivel" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="n in NIVELES" :key="n" :value="n">{{ n }}</option>
									</select>
								</div>
								<div class="flex flex-col gap-1">
									<label for="altura" class="text-sm font-medium text-neutral-100">Altura (m)</label>
									<input id="altura" v-model="form.altura" type="number" step="0.01" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="peso" class="text-sm font-medium text-neutral-100">Peso (kg)</label>
									<input id="peso" v-model="form.peso" type="number" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="experiencia" class="text-sm font-medium text-neutral-100">Años de experiencia en el deporte</label>
									<input id="experiencia" v-model="form.experiencia" type="number" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="redesSociales" class="text-sm font-medium text-neutral-100">Link de redes sociales</label>
									<input id="redesSociales" v-model="form.redesSociales" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1 sm:col-span-2">
									<label for="objetivosActuales" class="text-sm font-medium text-neutral-100">Objetivos actuales</label>
									<textarea id="objetivosActuales" v-model="form.objetivosActuales" rows="2" class="reg-input resize-none"></textarea>
								</div>
								<div class="flex flex-col gap-1">
									<label for="marcasPersonales" class="text-sm font-medium text-neutral-100"
										>Marcas personales <span class="text-neutral-400">(si aplica)</span></label
									>
									<input id="marcasPersonales" v-model="form.marcasPersonales" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="lesiones" class="text-sm font-medium text-neutral-100"
										>Lesiones <span class="text-neutral-400">(si aplica)</span></label
									>
									<input id="lesiones" v-model="form.lesiones" type="text" class="reg-input" />
								</div>
							</div>
						</div>
					</template>

					<!-- Marca -->
					<template v-else-if="tipoSeleccionado === 'Marca'">
						<div>
							<div class="mb-3 text-xs font-bold tracking-wider text-green-400 uppercase">Datos de la empresa</div>
							<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div class="flex flex-col gap-1">
									<label for="nombreComercial" class="text-sm font-medium text-neutral-100">Nombre de la empresa</label>
									<input id="nombreComercial" v-model="form.nombreComercial" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="nit" class="text-sm font-medium text-neutral-100">NIT</label>
									<input id="nit" v-model="form.nit" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="telefonoMarca" class="text-sm font-medium text-neutral-100">Teléfono de contacto</label>
									<input id="telefonoMarca" v-model="form.telefono" type="tel" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="direccionContacto" class="text-sm font-medium text-neutral-100">Dirección</label>
									<input id="direccionContacto" v-model="form.direccionContacto" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="nombreContacto" class="text-sm font-medium text-neutral-100">Nombre del contacto</label>
									<input id="nombreContacto" v-model="form.nombreContacto" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="cargoContacto" class="text-sm font-medium text-neutral-100">Cargo del contacto</label>
									<input id="cargoContacto" v-model="form.cargoContacto" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="redSocialUrl" class="text-sm font-medium text-neutral-100">URL de red social</label>
									<input id="redSocialUrl" v-model="form.redSocialUrl" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="sitioWebMarca" class="text-sm font-medium text-neutral-100">URL del aplicativo web</label>
									<input id="sitioWebMarca" v-model="form.sitioWeb" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1 sm:col-span-2">
									<label for="bioMarca" class="text-sm font-medium text-neutral-100">Descripción de la empresa</label>
									<textarea id="bioMarca" v-model="form.bio" rows="2" class="reg-input resize-none"></textarea>
								</div>
							</div>
						</div>
					</template>

					<!-- Nutricionista -->
					<template v-else-if="tipoSeleccionado === 'Nutricionista'">
						<div>
							<div class="mb-3 text-xs font-bold tracking-wider text-green-400 uppercase">Datos personales</div>
							<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div class="flex flex-col gap-1">
									<label for="nombresNutri" class="text-sm font-medium text-neutral-100">Nombres</label>
									<input id="nombresNutri" v-model="form.nombres" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="apellidosNutri" class="text-sm font-medium text-neutral-100">Apellidos</label>
									<input id="apellidosNutri" v-model="form.apellidos" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="fechaNacimientoNutri" class="text-sm font-medium text-neutral-100">Fecha de nacimiento</label>
									<input id="fechaNacimientoNutri" v-model="form.fechaNacimiento" type="date" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="generoNutri" class="text-sm font-medium text-neutral-100">Género</label>
									<select id="generoNutri" v-model="form.genero" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="g in GENEROS" :key="g" :value="g">{{ g }}</option>
									</select>
								</div>
								<div class="flex flex-col gap-1">
									<label for="telefonoNutri" class="text-sm font-medium text-neutral-100">Teléfono</label>
									<input id="telefonoNutri" v-model="form.telefono" type="tel" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="paisNutri" class="text-sm font-medium text-neutral-100">País</label>
									<select id="paisNutri" v-model="form.pais" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="p in PAISES" :key="p" :value="p">{{ p }}</option>
									</select>
								</div>
								<div class="flex flex-col gap-1">
									<label for="ciudadNutri" class="text-sm font-medium text-neutral-100">Ciudad de residencia</label>
									<input id="ciudadNutri" v-model="form.ciudadResidencia" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1 sm:col-span-2">
									<label for="bioNutri" class="text-sm font-medium text-neutral-100">Descripción corta</label>
									<textarea id="bioNutri" v-model="form.bio" rows="2" class="reg-input resize-none"></textarea>
								</div>
							</div>
						</div>
						<div>
							<div class="mb-3 text-xs font-bold tracking-wider text-green-400 uppercase">Perfil profesional</div>
							<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div class="flex flex-col gap-1">
									<label for="profesion" class="text-sm font-medium text-neutral-100">Título profesional</label>
									<input id="profesion" v-model="form.profesion" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="universidad" class="text-sm font-medium text-neutral-100">Universidad donde estudió</label>
									<input id="universidad" v-model="form.universidad" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="anoGraduacion" class="text-sm font-medium text-neutral-100">Año de graduación</label>
									<input id="anoGraduacion" v-model="form.anoGraduacion" type="number" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="especialidad" class="text-sm font-medium text-neutral-100">Especialidad</label>
									<input id="especialidad" v-model="form.especialidad" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="anosExperiencia" class="text-sm font-medium text-neutral-100">Años de experiencia</label>
									<input id="anosExperiencia" v-model="form.anosExperiencia" type="number" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="modalidadAtencion" class="text-sm font-medium text-neutral-100">Modalidad de atención</label>
									<select id="modalidadAtencion" v-model="form.modalidadAtencion" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="m in MODALIDADES" :key="m" :value="m">{{ m }}</option>
									</select>
								</div>
								<div class="flex flex-col gap-1">
									<label for="certificadosAdicionales" class="text-sm font-medium text-neutral-100"
										>Certificados adicionales <span class="text-neutral-400">(opcional)</span></label
									>
									<input id="certificadosAdicionales" v-model="form.certificadosAdicionales" type="text" class="reg-input" />
								</div>
							</div>
						</div>
					</template>

					<!-- Patrocinador -->
					<template v-else-if="tipoSeleccionado === 'Patrocinador'">
						<div>
							<div class="mb-3 text-xs font-bold tracking-wider text-green-400 uppercase">Datos personales</div>
							<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div class="flex flex-col gap-1">
									<label for="nombresPatro" class="text-sm font-medium text-neutral-100">Nombres</label>
									<input id="nombresPatro" v-model="form.nombres" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="apellidosPatro" class="text-sm font-medium text-neutral-100">Apellidos</label>
									<input id="apellidosPatro" v-model="form.apellidos" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="fechaNacimientoPatro" class="text-sm font-medium text-neutral-100">Fecha de nacimiento</label>
									<input id="fechaNacimientoPatro" v-model="form.fechaNacimiento" type="date" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="telefonoPatro" class="text-sm font-medium text-neutral-100">Teléfono</label>
									<input id="telefonoPatro" v-model="form.telefono" type="tel" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="paisPatro" class="text-sm font-medium text-neutral-100">País</label>
									<select id="paisPatro" v-model="form.pais" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="p in PAISES" :key="p" :value="p">{{ p }}</option>
									</select>
								</div>
								<div class="flex flex-col gap-1">
									<label for="ciudadPatro" class="text-sm font-medium text-neutral-100">Ciudad</label>
									<input id="ciudadPatro" v-model="form.ciudadResidencia" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1">
									<label for="sitioWebPatro" class="text-sm font-medium text-neutral-100"
										>Sitio web <span class="text-neutral-400">(opcional)</span></label
									>
									<input id="sitioWebPatro" v-model="form.sitioWeb" type="text" class="reg-input" />
								</div>
								<div class="flex flex-col gap-1 sm:col-span-2">
									<label for="bioPatro" class="text-sm font-medium text-neutral-100">Descripción breve</label>
									<textarea id="bioPatro" v-model="form.bio" rows="2" class="reg-input resize-none"></textarea>
								</div>
							</div>
						</div>
					</template>

					<div class="my-2 flex items-start gap-2">
						<input
							id="aceptaTerminos"
							v-model="form.aceptaTerminos"
							type="checkbox"
							required
							class="mt-1 h-4 w-4 accent-green-700" />
						<label for="aceptaTerminos" class="text-sm text-neutral-100">
							Acepto los
							<NuxtLink to="/terms" target="_blank" class="text-green-400 hover:underline">Términos y Condiciones</NuxtLink>
							de Elite Hub.
						</label>
					</div>

					<div v-if="error || authStore.error" class="text-center text-sm text-red-500">
						{{ error || authStore.error }}
					</div>

					<button
						type="submit"
						:disabled="isLoading || !form.tipoUsuarioId"
						class="button-primary px-5 py-2.5 text-center text-sm font-bold focus:ring-2 focus:ring-white focus:outline-none disabled:opacity-50">
						<span v-if="!isLoading">Crear cuenta</span>
						<span v-else>Registrando...</span>
					</button>

					<span class="text-center text-sm text-white">
						¿Ya tienes una cuenta?
						<NuxtLink to="/login" class="font-semibold text-green-600 hover:underline">Inicia sesión</NuxtLink>
					</span>
				</form>
			</div>

			<!-- Panel de marca (reemplaza la foto de stock Jugador.jpeg) -->
			<div class="hidden items-center justify-center bg-gray-50 p-12 lg:flex">
				<div class="max-w-sm text-center">
					<div
						class="mx-auto mb-6 flex h-19 w-19 items-center justify-center rounded-full bg-black text-2xl font-bold text-white">
						EH
					</div>
					<h2 class="mb-3 text-2xl font-bold text-gray-900">Únete a la comunidad deportiva</h2>
					<p class="text-sm leading-relaxed text-gray-600">
						Deportistas, marcas, nutricionistas y patrocinadores, en un mismo lugar. Tu tipo de perfil define lo que ves y lo
						que puedes hacer desde el primer momento.
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
definePageMeta({
	auth: {
		unauthenticatedOnly: true,
		navigateUnauthenticatedTo: "/",
	},
});

import { ref, reactive, computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { GENEROS, PAISES } from "#shared/utils/fixedLists";

const NIVELES = ["PRINCIPIANTE", "INTERMEDIO", "AVANZADO", "PROFESIONAL"];
const MODALIDADES = ["PRESENCIAL", "VIRTUAL", "VIRTUAL/PRESENCIAL"];

const isLoading = ref(false);
const error = ref<string | null>(null);
const authStore = useAuthStore();

const tiposUsuario = ref<{ id: number; tipo: string }[]>([]);
const deportes = ref<{ id: number; nombre: string }[]>([]);

const form = reactive<Record<string, any>>({
	tipoUsuarioId: null,
	correo: "",
	password: "",
	aceptaTerminos: false,
});

const tipoSeleccionado = computed(() => tiposUsuario.value.find((t) => t.id === form.tipoUsuarioId)?.tipo ?? null);

function selectTipo(tipo: { id: number; tipo: string }) {
	form.tipoUsuarioId = tipo.id;
}

onMounted(async () => {
	try {
		tiposUsuario.value = await $fetch("/api/tipousuario");
		deportes.value = await $fetch("/api/deportes");
		// Deportista preseleccionado por defecto: evita un clic extra al llegar al formulario.
		const deportista = tiposUsuario.value.find((t) => t.tipo === "Deportista");
		if (deportista) {
			form.tipoUsuarioId = deportista.id;
		}
	} catch (e) {
		console.error("Error cargando catálogos de registro:", e);
	}
});

async function handleSubmit() {
	try {
		isLoading.value = true;
		error.value = null;

		const success = await authStore.register({ ...form });

		if (success) {
			await navigateTo("/");
		} else {
			error.value = authStore.error || "Error durante el registro";
		}
	} catch (e: any) {
		console.error("Error en el registro:", e);
		error.value = e?.data?.message || "Ocurrió un error durante el registro. Por favor intenta nuevamente.";
	} finally {
		isLoading.value = false;
	}
}
</script>

<style scoped>
.reg-input {
	border-radius: 0.5rem;
	border: 1px solid #e5e7eb;
	background: #ffffff;
	padding: 0.5rem 0.75rem;
	font-size: 0.875rem;
	color: #111827;
}
</style>
