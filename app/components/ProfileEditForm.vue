<template>
	<form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
		<div class="form-grid">
			<h3 class="form-group-title">Tu cuenta</h3>
			<div class="form-field">
				<span class="form-label">Tipo de usuario</span>
				<p class="rounded-md border border-border-hairline bg-surface-container-high px-3.5 py-2.5 text-on-surface dark:text-on-surface-dark dark:border-border-hairline-dark dark:bg-surface-container-high-dark">
					{{ tipo || "Sin tipo asignado" }}
				</p>
				<p class="form-hint">El tipo de usuario no se puede cambiar.</p>
			</div>
			<div class="form-field">
				<label for="correo" class="form-label">Correo</label>
				<input id="correo" v-model="form.correo" type="email" required class="form-control" />
			</div>

			<!-- Avatar -->
			<div class="form-field sm:col-span-2">
				<label for="avatarFile" class="form-label">Foto de perfil</label>
				<div class="flex flex-wrap items-center gap-5">
					<img v-if="avatarPreview" :src="avatarPreview" alt="Tu foto de perfil" class="h-24 w-24 rounded-lg bg-black object-cover" />
					<span v-else class="flex h-24 w-24 items-center justify-center rounded-lg bg-black text-white">
						<Icon name="fa6-solid:user" aria-hidden="true" class="text-3xl" />
					</span>
					<div class="min-w-0 flex-1">
						<input id="avatarFile" type="file" accept="image/*" class="form-file" @change="handleAvatarUpload" />
						<p class="form-hint mt-2">Es la foto que aparece en tu ficha del directorio.</p>
					</div>
				</div>
				<p v-if="avatarError" role="alert" class="text-sm font-semibold text-destructive dark:text-destructive-dark">{{ avatarError }}</p>
			</div>
		</div>

		<!-- Deportista -->
		<template v-if="tipo === 'Deportista'">
			<div class="form-grid">
				<h3 class="form-group-title">Datos personales</h3>
				<div class="form-field">
					<label for="nombre" class="form-label">Primer nombre</label>
					<input id="nombre" v-model="form.nombre" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="segundoNombre" class="form-label">Segundo nombre</label>
					<input id="segundoNombre" v-model="form.informacion.segundoNombre" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="apellido" class="form-label">Primer apellido</label>
					<input id="apellido" v-model="form.apellido" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="segundoApellido" class="form-label">Segundo apellido</label>
					<input id="segundoApellido" v-model="form.informacion.segundoApellido" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="fechaNacimiento" class="form-label">Fecha de nacimiento</label>
					<input id="fechaNacimiento" v-model="form.informacion.fechaNacimiento" type="date" class="form-control" />
				</div>
				<div class="form-field">
					<label for="genero" class="form-label">Género</label>
					<select id="genero" v-model="form.informacion.genero" class="form-control">
						<option value="">Selecciona…</option>
						<option v-for="g in GENEROS" :key="g" :value="g">{{ g }}</option>
					</select>
				</div>
				<div class="form-field">
					<label for="nacionalidad" class="form-label">Nacionalidad</label>
					<select id="nacionalidad" v-model="form.informacion.nacionalidad" class="form-control">
						<option value="">Selecciona…</option>
						<option v-for="p in PAISES" :key="p" :value="p">{{ p }}</option>
					</select>
				</div>
				<div class="form-field">
					<label for="ciudadResidencia" class="form-label">Ciudad de residencia</label>
					<input id="ciudadResidencia" v-model="form.informacion.ciudadResidencia" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="telefono" class="form-label">Teléfono</label>
					<input id="telefono" v-model="form.informacion.telefono" type="tel" class="form-control" />
				</div>
				<div class="form-field sm:col-span-2">
					<label for="bio" class="form-label">Biografía corta</label>
					<textarea id="bio" v-model="form.informacion.bio" rows="3" class="form-control"></textarea>
				</div>
				<h3 class="form-group-title">Tu deporte</h3>
				<div class="form-field">
					<label for="deporteId" class="form-label">Deporte</label>
					<select id="deporteId" v-model="form.deporte.deporteId" class="form-control">
						<option :value="null">Selecciona…</option>
						<option v-for="d in deportesFocales" :key="d.id" :value="d.id">{{ d.nombre }}</option>
					</select>
				</div>
				<div class="form-field">
					<label for="nivel" class="form-label">Nivel deportivo</label>
					<select id="nivel" v-model="form.deporte.nivel" class="form-control">
						<option value="">Selecciona…</option>
						<option v-for="n in NIVELES" :key="n" :value="n">{{ n }}</option>
					</select>
				</div>
				<div class="form-field">
					<label for="altura" class="form-label">Altura (m)</label>
					<input id="altura" v-model="form.informacion.altura" type="number" step="0.01" class="form-control" />
				</div>
				<div class="form-field">
					<label for="peso" class="form-label">Peso (kg)</label>
					<input id="peso" v-model="form.informacion.peso" type="number" class="form-control" />
				</div>
				<div class="form-field">
					<label for="experiencia" class="form-label">Años de experiencia en el deporte</label>
					<input id="experiencia" v-model="form.deporte.experiencia" type="number" class="form-control" />
				</div>
				<div class="form-field">
					<label for="redSocialUrl" class="form-label">Link de redes sociales</label>
					<input id="redSocialUrl" v-model="form.redSocialUrl" type="text" class="form-control" />
				</div>
				<div class="form-field sm:col-span-2">
					<label for="objetivosActuales" class="form-label">Objetivos actuales</label>
					<textarea id="objetivosActuales" v-model="form.informacion.objetivosActuales" rows="3" class="form-control"></textarea>
				</div>
				<div class="form-field">
					<label for="marcasPersonales" class="form-label">Marcas personales</label>
					<input id="marcasPersonales" v-model="form.informacion.marcasPersonales" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="lesiones" class="form-label">Lesiones</label>
					<input id="lesiones" v-model="form.informacion.lesiones" type="text" class="form-control" />
				</div>
			</div>

			<!-- Campos específicos de Fútbol (FR-50) -->
			<div v-if="deporteSeleccionadoNombre === 'Fútbol'" class="form-grid">
				<h3 class="form-group-title">Fútbol</h3>
				<div class="form-field">
					<label for="posicionPrincipal" class="form-label">Posición principal</label>
					<select id="posicionPrincipal" v-model="form.deporte.camposEspecificos.posicionPrincipal" class="form-control">
						<option value="">Selecciona…</option>
						<option v-for="p in FUTBOL_POSICIONES" :key="p" :value="p">{{ p }}</option>
					</select>
				</div>
				<div class="form-field">
					<label for="posicionSecundaria" class="form-label">Posición secundaria (opcional)</label>
					<select id="posicionSecundaria" v-model="form.deporte.camposEspecificos.posicionSecundaria" class="form-control">
						<option value="">Selecciona…</option>
						<option v-for="p in FUTBOL_POSICIONES" :key="p" :value="p">{{ p }}</option>
					</select>
				</div>
				<div class="form-field">
					<label for="pieDominante" class="form-label">Pie dominante</label>
					<select id="pieDominante" v-model="form.deporte.camposEspecificos.pieDominante" class="form-control">
						<option value="">Selecciona…</option>
						<option v-for="p in FUTBOL_PIE_DOMINANTE" :key="p" :value="p">{{ p }}</option>
					</select>
				</div>
				<div class="form-field">
					<label for="clubActual" class="form-label">Club actual</label>
					<input id="clubActual" v-model="form.deporte.camposEspecificos.clubActual" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="nivelCompetencia" class="form-label">Categoría/nivel de competencia</label>
					<select id="nivelCompetencia" v-model="form.deporte.camposEspecificos.nivelCompetencia" class="form-control">
						<option value="">Selecciona…</option>
						<option v-for="n in FUTBOL_NIVEL_COMPETENCIA" :key="n" :value="n">{{ n }}</option>
					</select>
				</div>
				<div class="form-field">
					<label for="saltoVertical" class="form-label">Salto vertical (cm)</label>
					<input id="saltoVertical" v-model="form.deporte.camposEspecificos.saltoVertical" type="number" class="form-control" />
				</div>
				<div class="form-field sm:col-span-2">
					<label class="form-label">Atributos destacados</label>
					<FilterChips
						:options="FUTBOL_ATRIBUTOS.map((a) => ({ value: a, label: a }))"
						v-model="form.deporte.camposEspecificos.atributosDestacados"
						multiple />
				</div>
				<div class="form-field sm:col-span-2">
					<label for="otrasCualidades" class="form-label">Otras cualidades (opcional)</label>
					<input id="otrasCualidades" v-model="form.deporte.camposEspecificos.otrasCualidades" type="text" class="form-control" />
				</div>
				<div class="form-field sm:col-span-2">
					<label for="trayectoriaClubes" class="form-label">Trayectoria de clubes</label>
					<textarea id="trayectoriaClubes" v-model="form.deporte.camposEspecificos.trayectoriaClubes" rows="3" class="form-control"></textarea>
				</div>
				<div class="form-field sm:col-span-2">
					<label for="logrosTitulos" class="form-label">Logros y títulos</label>
					<textarea id="logrosTitulos" v-model="form.deporte.camposEspecificos.logrosTitulos" rows="3" class="form-control"></textarea>
				</div>
				<div class="form-field sm:col-span-2">
					<label for="reconocimientosIndividuales" class="form-label">Reconocimientos individuales</label>
					<textarea id="reconocimientosIndividuales" v-model="form.deporte.camposEspecificos.reconocimientosIndividuales" rows="3" class="form-control"></textarea>
				</div>
				<div class="form-field sm:col-span-2">
					<label for="estadisticasUltimaTemporada" class="form-label">Estadísticas de la última temporada</label>
					<textarea id="estadisticasUltimaTemporada" v-model="form.deporte.camposEspecificos.estadisticasUltimaTemporada" rows="3" class="form-control"></textarea>
				</div>
				<div class="form-field sm:col-span-2">
					<label for="convocatoriasSelecciones" class="form-label">Convocatorias/selecciones</label>
					<textarea id="convocatoriasSelecciones" v-model="form.deporte.camposEspecificos.convocatoriasSelecciones" rows="3" class="form-control"></textarea>
				</div>
			</div>

			<!-- Campos específicos de Boxeo (FR-50) -->
			<div v-else-if="deporteSeleccionadoNombre === 'Boxeo'" class="form-grid">
				<h3 class="form-group-title">Boxeo</h3>
				<div class="form-field">
					<label for="categoriaPeso" class="form-label">Categoría de peso</label>
					<select id="categoriaPeso" v-model="form.deporte.camposEspecificos.categoriaPeso" class="form-control">
						<option value="">Selecciona…</option>
						<option v-for="c in BOXEO_CATEGORIAS_PESO" :key="c" :value="c">{{ c }}</option>
					</select>
				</div>
				<div class="form-field">
					<label for="guardia" class="form-label">Guardia</label>
					<select id="guardia" v-model="form.deporte.camposEspecificos.guardia" class="form-control">
						<option value="">Selecciona…</option>
						<option v-for="g in BOXEO_GUARDIA" :key="g" :value="g">{{ g }}</option>
					</select>
				</div>
				<div class="form-field">
					<label for="gimnasioClubEntrenador" class="form-label">Gimnasio/club y entrenador</label>
					<input id="gimnasioClubEntrenador" v-model="form.deporte.camposEspecificos.gimnasioClubEntrenador" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="estiloPelea" class="form-label">Estilo de pelea</label>
					<select id="estiloPelea" v-model="form.deporte.camposEspecificos.estiloPelea" class="form-control">
						<option value="">Selecciona…</option>
						<option v-for="e in BOXEO_ESTILO" :key="e" :value="e">{{ e }}</option>
					</select>
				</div>
				<div class="form-field">
					<label for="modalidad" class="form-label">Modalidad</label>
					<select id="modalidad" v-model="form.deporte.camposEspecificos.modalidad" class="form-control">
						<option value="">Selecciona…</option>
						<option v-for="m in BOXEO_MODALIDAD" :key="m" :value="m">{{ m }}</option>
					</select>
				</div>
				<div class="form-field">
					<label for="record" class="form-label">Récord</label>
					<input id="record" v-model="form.deporte.camposEspecificos.record" type="text" class="form-control" />
				</div>
				<div class="form-field sm:col-span-2">
					<label for="federacionLiga" class="form-label">Federación/liga u organismo sancionador</label>
					<input id="federacionLiga" v-model="form.deporte.camposEspecificos.federacionLiga" type="text" class="form-control" />
				</div>
				<div class="form-field sm:col-span-2">
					<label for="convocatoriasLogrosRankings" class="form-label">Convocatorias/logros/rankings</label>
					<textarea id="convocatoriasLogrosRankings" v-model="form.deporte.camposEspecificos.convocatoriasLogrosRankings" rows="3" class="form-control"></textarea>
				</div>
			</div>

			<!-- Deporte "Otros": permite indicar cuál deporte practica (FR-50) -->
			<div v-else-if="deporteSeleccionadoNombre === 'Otros'" class="form-grid">
				<div class="form-field sm:col-span-2">
					<label for="nombreDeporte" class="form-label">¿Qué deporte practicas? <span class="font-normal text-on-surface-variant dark:text-on-surface-variant-dark">(opcional)</span></label>
					<input id="nombreDeporte" v-model="form.deporte.camposEspecificos.nombreDeporte" type="text" placeholder="Ej: Ajedrez, Tenis, Atletismo…" class="form-control" />
				</div>
			</div>
		</template>

		<!-- Marca -->
		<template v-else-if="tipo === 'Marca'">
			<div class="form-grid">
				<h3 class="form-group-title">La empresa</h3>
				<div class="form-field">
					<label for="nombreComercial" class="form-label">Nombre de la empresa</label>
					<input id="nombreComercial" v-model="form.nombre" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="nit" class="form-label">NIT</label>
					<input id="nit" v-model="form.informacion.nit" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="telefonoMarca" class="form-label">Teléfono de contacto</label>
					<input id="telefonoMarca" v-model="form.informacion.telefono" type="tel" class="form-control" />
				</div>
				<div class="form-field">
					<label for="direccionContacto" class="form-label">Dirección</label>
					<input id="direccionContacto" v-model="form.informacion.direccionContacto" type="text" class="form-control" />
				</div>
				<h3 class="form-group-title">Persona de contacto</h3>
				<div class="form-field">
					<label for="nombreContacto" class="form-label">Nombre del contacto</label>
					<input id="nombreContacto" v-model="form.informacion.nombreContacto" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="cargoContacto" class="form-label">Cargo del contacto</label>
					<input id="cargoContacto" v-model="form.informacion.cargoContacto" type="text" class="form-control" />
				</div>
				<h3 class="form-group-title">En internet</h3>
				<div class="form-field">
					<label for="redSocialUrlMarca" class="form-label">URL de red social</label>
					<input id="redSocialUrlMarca" v-model="form.redSocialUrl" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="sitioWebMarca" class="form-label">URL del aplicativo web</label>
					<input id="sitioWebMarca" v-model="form.informacion.sitioWeb" type="text" class="form-control" />
				</div>
				<div class="form-field sm:col-span-2">
					<label for="bioMarca" class="form-label">Descripción de la empresa</label>
					<textarea id="bioMarca" v-model="form.informacion.bio" rows="3" class="form-control"></textarea>
				</div>
			</div>
		</template>

		<!-- Nutricionista -->
		<template v-else-if="tipo === 'Nutricionista'">
			<div class="form-grid">
				<h3 class="form-group-title">Datos personales</h3>
				<div class="form-field">
					<label for="nombresNutri" class="form-label">Nombres</label>
					<input id="nombresNutri" v-model="form.nombre" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="apellidosNutri" class="form-label">Apellidos</label>
					<input id="apellidosNutri" v-model="form.apellido" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="fechaNacimientoNutri" class="form-label">Fecha de nacimiento</label>
					<input id="fechaNacimientoNutri" v-model="form.informacion.fechaNacimiento" type="date" class="form-control" />
				</div>
				<div class="form-field">
					<label for="generoNutri" class="form-label">Género</label>
					<select id="generoNutri" v-model="form.informacion.genero" class="form-control">
						<option value="">Selecciona…</option>
						<option v-for="g in GENEROS" :key="g" :value="g">{{ g }}</option>
					</select>
				</div>
				<div class="form-field">
					<label for="telefonoNutri" class="form-label">Teléfono</label>
					<input id="telefonoNutri" v-model="form.informacion.telefono" type="tel" class="form-control" />
				</div>
				<div class="form-field">
					<label for="paisNutri" class="form-label">País</label>
					<select id="paisNutri" v-model="form.informacion.pais" class="form-control">
						<option value="">Selecciona…</option>
						<option v-for="p in PAISES" :key="p" :value="p">{{ p }}</option>
					</select>
				</div>
				<div class="form-field">
					<label for="ciudadNutri" class="form-label">Ciudad de residencia</label>
					<input id="ciudadNutri" v-model="form.informacion.ciudadResidencia" type="text" class="form-control" />
				</div>
				<div class="form-field sm:col-span-2">
					<label for="bioNutri" class="form-label">Descripción corta</label>
					<textarea id="bioNutri" v-model="form.informacion.bio" rows="3" class="form-control"></textarea>
				</div>
				<h3 class="form-group-title">Formación y experiencia</h3>
				<div class="form-field">
					<label for="profesion" class="form-label">Título profesional</label>
					<input id="profesion" v-model="form.informacion.profesion" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="universidad" class="form-label">Universidad donde estudió</label>
					<input id="universidad" v-model="form.informacion.universidad" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="anoGraduacion" class="form-label">Año de graduación</label>
					<input id="anoGraduacion" v-model="form.informacion.anoGraduacion" type="number" class="form-control" />
				</div>
				<div class="form-field">
					<label for="especialidad" class="form-label">Especialidad</label>
					<input id="especialidad" v-model="form.informacion.especialidad" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="anosExperiencia" class="form-label">Años de experiencia</label>
					<input id="anosExperiencia" v-model="form.informacion.anosExperiencia" type="number" class="form-control" />
				</div>
				<div class="form-field">
					<label for="modalidadAtencion" class="form-label">Modalidad de atención</label>
					<select id="modalidadAtencion" v-model="form.informacion.modalidadAtencion" class="form-control">
						<option value="">Selecciona…</option>
						<option v-for="m in MODALIDADES" :key="m" :value="m">{{ m }}</option>
					</select>
				</div>
				<div class="form-field">
					<label for="certificadosAdicionales" class="form-label">Certificados adicionales</label>
					<input id="certificadosAdicionales" v-model="form.informacion.certificadosAdicionales" type="text" class="form-control" />
				</div>
			</div>
		</template>

		<!-- Patrocinador -->
		<template v-else-if="tipo === 'Patrocinador'">
			<div class="form-grid">
				<h3 class="form-group-title">Datos personales</h3>
				<div class="form-field">
					<label for="nombresPatro" class="form-label">Nombres</label>
					<input id="nombresPatro" v-model="form.nombre" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="apellidosPatro" class="form-label">Apellidos</label>
					<input id="apellidosPatro" v-model="form.apellido" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="fechaNacimientoPatro" class="form-label">Fecha de nacimiento</label>
					<input id="fechaNacimientoPatro" v-model="form.informacion.fechaNacimiento" type="date" class="form-control" />
				</div>
				<div class="form-field">
					<label for="telefonoPatro" class="form-label">Teléfono</label>
					<input id="telefonoPatro" v-model="form.informacion.telefono" type="tel" class="form-control" />
				</div>
				<div class="form-field">
					<label for="paisPatro" class="form-label">País</label>
					<select id="paisPatro" v-model="form.informacion.pais" class="form-control">
						<option value="">Selecciona…</option>
						<option v-for="p in PAISES" :key="p" :value="p">{{ p }}</option>
					</select>
				</div>
				<div class="form-field">
					<label for="ciudadPatro" class="form-label">Ciudad</label>
					<input id="ciudadPatro" v-model="form.informacion.ciudadResidencia" type="text" class="form-control" />
				</div>
				<div class="form-field">
					<label for="sitioWebPatro" class="form-label">Sitio web</label>
					<input id="sitioWebPatro" v-model="form.informacion.sitioWeb" type="text" class="form-control" />
				</div>
				<div class="form-field sm:col-span-2">
					<label for="bioPatro" class="form-label">Descripción breve</label>
					<textarea id="bioPatro" v-model="form.informacion.bio" rows="3" class="form-control"></textarea>
				</div>
			</div>
		</template>

		<div class="flex justify-end border-t border-border-hairline pt-6 dark:border-border-hairline-dark">
			<button type="submit" :disabled="submitting" class="button-primary form-submit focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
				<Icon v-if="submitting" name="fa6-solid:spinner" aria-hidden="true" class="animate-spin motion-reduce:animate-none" />
				{{ submitting ? "Guardando…" : "Guardar cambios" }}
			</button>
		</div>
	</form>
</template>

<script lang="ts" setup>
import { GENEROS, PAISES, DEPORTES_ENFOCADOS } from "#shared/utils/fixedLists";
import {
	FUTBOL_POSICIONES,
	FUTBOL_PIE_DOMINANTE,
	FUTBOL_NIVEL_COMPETENCIA,
	FUTBOL_ATRIBUTOS,
	BOXEO_CATEGORIAS_PESO,
	BOXEO_GUARDIA,
	BOXEO_ESTILO,
	BOXEO_MODALIDAD,
} from "#shared/utils/camposDeporte";

const NIVELES = ["PRINCIPIANTE", "INTERMEDIO", "ELITE", "PROFESIONAL"];
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

const legacyDeporteNombre = computed(() => props.usuario?.UsuarioDeporte?.[0]?.deporte?.nombre ?? null);
const deportesFocales = computed(() => {
	const focales = DEPORTES_ENFOCADOS.map((nombre) => deportes.value.find((d) => d.nombre === nombre)).filter(Boolean);
	if (legacyDeporteNombre.value && !(DEPORTES_ENFOCADOS as readonly string[]).includes(legacyDeporteNombre.value)) {
		const legacy = deportes.value.find((d) => d.nombre === legacyDeporteNombre.value);
		if (legacy) focales.push(legacy);
	}
	return focales;
});

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
			camposEspecificos: deporte?.camposEspecificos ?? {},
		},
		redSocialUrl: redSocial?.url || "",
	};
}

const form = reactive(buildForm());

const deporteSeleccionadoNombre = computed(
	() => deportes.value.find((d) => d.id === form.deporte.deporteId)?.nombre ?? null,
);

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
	padding: 0.5rem 0.75rem;
	font-size: 0.875rem;
}
</style>
