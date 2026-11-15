<template>
	<div class="mx-auto h-full max-w-[120rem] p-6">
		<div
			class="grid min-h-[600px] grid-cols-1 overflow-clip rounded-lg lg:grid-cols-[1.35fr_1fr]">
			<!-- Panel de formulario -->
			<div class="flex flex-col gap-5 bg-black px-6 py-10 text-white sm:px-10">
				<h1 class="font-display text-6xl leading-[0.9] font-extrabold uppercase sm:text-7xl">Crea tu cuenta</h1>
				<p class="max-w-[55ch] text-lg text-neutral-300">Primero elige tu tipo de perfil. Los datos que te pedimos cambian según el que elijas.</p>

				<div class="grid grid-cols-2 gap-3 xl:grid-cols-4" role="group" aria-label="Tipo de perfil">
					<button
						v-for="tipo in tiposUsuario"
						:key="tipo.id"
						type="button"
						:aria-pressed="form.tipoUsuarioId === tipo.id"
						class="flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition duration-200 hover:-translate-y-1 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none motion-reduce:hover:translate-y-0"
						:class="
							form.tipoUsuarioId === tipo.id
								? 'border-primary-dark bg-primary-dark text-black'
								: 'border-neutral-700 bg-neutral-900 text-white hover:border-neutral-400'
						"
						@click="selectTipo(tipo)">
						<Icon :name="TIPO_INFO[tipo.tipo]?.icon || 'fa6-solid:user'" aria-hidden="true" class="text-2xl" />
						<span class="font-display text-3xl leading-none font-extrabold uppercase">{{ tipo.tipo }}</span>
						<span class="text-sm" :class="form.tipoUsuarioId === tipo.id ? 'text-black' : 'text-neutral-300'">
							{{ TIPO_INFO[tipo.tipo]?.texto }}
						</span>
					</button>
				</div>

				<form class="mt-2 flex flex-col gap-8" @submit.prevent="handleSubmit">
					<!-- Datos de acceso (todos los tipos) -->
					<div>
						<div class="mb-4 border-b border-neutral-700 pb-2 font-display text-3xl leading-none font-extrabold text-white uppercase">Datos de acceso</div>
						<div class="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
							<div class="reg-field">
								<label for="correo" class="reg-label">Correo electrónico</label>
								<input
									id="correo"
									v-model="form.correo"
									type="email"
									required
									class="reg-input" />
							</div>
							<div class="reg-field">
								<label for="password" class="reg-label">Contraseña</label>
								<input
									id="password"
									v-model="form.password"
									type="password"
									required
									placeholder="Mínimo 8 caracteres"
									class="reg-input" />
							</div>
						</div>
					</div>

					<!-- Deportista -->
					<template v-if="tipoSeleccionado === 'Deportista'">
						<div>
							<div class="mb-4 border-b border-neutral-700 pb-2 font-display text-3xl leading-none font-extrabold text-white uppercase">Datos personales</div>
							<div class="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
								<div class="reg-field">
									<label for="primerNombre" class="reg-label">Primer nombre</label>
									<input id="primerNombre" v-model="form.primerNombre" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="segundoNombre" class="reg-label">Segundo nombre</label>
									<input id="segundoNombre" v-model="form.segundoNombre" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="primerApellido" class="reg-label">Primer apellido</label>
									<input id="primerApellido" v-model="form.primerApellido" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="segundoApellido" class="reg-label">Segundo apellido</label>
									<input id="segundoApellido" v-model="form.segundoApellido" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="fechaNacimiento" class="reg-label">Fecha de nacimiento</label>
									<input id="fechaNacimiento" v-model="form.fechaNacimiento" type="date" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="genero" class="reg-label">Género</label>
									<select id="genero" v-model="form.genero" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="g in GENEROS" :key="g" :value="g">{{ g }}</option>
									</select>
								</div>
								<div class="reg-field">
									<label for="nacionalidad" class="reg-label">Nacionalidad</label>
									<select id="nacionalidad" v-model="form.nacionalidad" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="p in PAISES" :key="p" :value="p">{{ p }}</option>
									</select>
								</div>
								<div class="reg-field">
									<label for="ciudadResidencia" class="reg-label">Ciudad de residencia</label>
									<input id="ciudadResidencia" v-model="form.ciudadResidencia" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="telefono" class="reg-label"
										>Teléfono <span class="text-neutral-400">(opcional)</span></label
									>
									<input id="telefono" v-model="form.telefono" type="tel" class="reg-input" />
								</div>
								<div class="reg-field sm:col-span-2">
									<label for="bio" class="reg-label">Biografía corta</label>
									<textarea id="bio" v-model="form.bio" rows="3" class="reg-input"></textarea>
								</div>
							</div>
						</div>
						<div>
							<div class="mb-4 border-b border-neutral-700 pb-2 font-display text-3xl leading-none font-extrabold text-white uppercase">Perfil deportivo</div>
							<div class="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
								<div class="reg-field">
									<label for="deporteId" class="reg-label">Deporte</label>
									<select id="deporteId" v-model="form.deporteId" class="reg-input">
										<option :value="null">Selecciona…</option>
										<option v-for="d in deportesFocales" :key="d.id" :value="d.id">{{ d.nombre }}</option>
									</select>
								</div>
								<div class="reg-field">
									<label for="nivel" class="reg-label">Nivel deportivo</label>
									<select id="nivel" v-model="form.nivel" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="n in NIVELES" :key="n" :value="n">{{ n }}</option>
									</select>
								</div>
								<div class="reg-field">
									<label for="altura" class="reg-label">Altura (m)</label>
									<input id="altura" v-model="form.altura" type="number" step="0.01" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="peso" class="reg-label">Peso (kg)</label>
									<input id="peso" v-model="form.peso" type="number" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="experiencia" class="reg-label">Años de experiencia en el deporte</label>
									<input id="experiencia" v-model="form.experiencia" type="number" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="redesSociales" class="reg-label">Link de redes sociales</label>
									<input id="redesSociales" v-model="form.redesSociales" type="text" class="reg-input" />
								</div>
								<div class="reg-field sm:col-span-2">
									<label for="objetivosActuales" class="reg-label">Objetivos actuales</label>
									<textarea id="objetivosActuales" v-model="form.objetivosActuales" rows="3" class="reg-input"></textarea>
								</div>
								<div class="reg-field">
									<label for="marcasPersonales" class="reg-label"
										>Marcas personales <span class="text-neutral-400">(si aplica)</span></label
									>
									<input id="marcasPersonales" v-model="form.marcasPersonales" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="lesiones" class="reg-label"
										>Lesiones <span class="text-neutral-400">(si aplica)</span></label
									>
									<input id="lesiones" v-model="form.lesiones" type="text" class="reg-input" />
								</div>
							</div>
						</div>

						<!-- Campos específicos de Fútbol (FR-50) -->
						<div v-if="deporteSeleccionadoNombre === 'Fútbol'">
							<div class="mb-4 border-b border-neutral-700 pb-2 font-display text-3xl leading-none font-extrabold text-white uppercase">Perfil de fútbol</div>
							<div class="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
								<div class="reg-field">
									<label for="posicionPrincipal" class="reg-label">Posición principal</label>
									<select id="posicionPrincipal" v-model="form.camposEspecificos.posicionPrincipal" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="p in FUTBOL_POSICIONES" :key="p" :value="p">{{ p }}</option>
									</select>
								</div>
								<div class="reg-field">
									<label for="posicionSecundaria" class="reg-label"
										>Posición secundaria <span class="text-neutral-400">(opcional)</span></label
									>
									<select id="posicionSecundaria" v-model="form.camposEspecificos.posicionSecundaria" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="p in FUTBOL_POSICIONES" :key="p" :value="p">{{ p }}</option>
									</select>
								</div>
								<div class="reg-field">
									<label for="pieDominante" class="reg-label">Pie dominante</label>
									<select id="pieDominante" v-model="form.camposEspecificos.pieDominante" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="p in FUTBOL_PIE_DOMINANTE" :key="p" :value="p">{{ p }}</option>
									</select>
								</div>
								<div class="reg-field">
									<label for="clubActual" class="reg-label">Club actual</label>
									<input id="clubActual" v-model="form.camposEspecificos.clubActual" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="nivelCompetencia" class="reg-label">Categoría/nivel de competencia</label>
									<select id="nivelCompetencia" v-model="form.camposEspecificos.nivelCompetencia" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="n in FUTBOL_NIVEL_COMPETENCIA" :key="n" :value="n">{{ n }}</option>
									</select>
								</div>
								<div class="reg-field">
									<label for="saltoVertical" class="reg-label">Salto vertical (cm)</label>
									<input id="saltoVertical" v-model="form.camposEspecificos.saltoVertical" type="number" class="reg-input" />
								</div>
								<div class="reg-field sm:col-span-2">
									<label class="reg-label">Atributos destacados</label>
									<FilterChips
										:options="FUTBOL_ATRIBUTOS.map((a) => ({ value: a, label: a }))"
										v-model="form.camposEspecificos.atributosDestacados"
										multiple />
								</div>
								<div class="reg-field sm:col-span-2">
									<label for="otrasCualidades" class="reg-label"
										>Otras cualidades <span class="text-neutral-400">(opcional)</span></label
									>
									<input id="otrasCualidades" v-model="form.camposEspecificos.otrasCualidades" type="text" class="reg-input" />
								</div>
								<div class="reg-field sm:col-span-2">
									<label for="trayectoriaClubes" class="reg-label">Trayectoria de clubes</label>
									<textarea
										id="trayectoriaClubes"
										v-model="form.camposEspecificos.trayectoriaClubes"
										rows="2"
										class="reg-input resize-none"></textarea>
								</div>
								<div class="reg-field sm:col-span-2">
									<label for="logrosTitulos" class="reg-label">Logros y títulos</label>
									<textarea
										id="logrosTitulos"
										v-model="form.camposEspecificos.logrosTitulos"
										rows="2"
										class="reg-input resize-none"></textarea>
								</div>
								<div class="reg-field sm:col-span-2">
									<label for="reconocimientosIndividuales" class="reg-label"
										>Reconocimientos individuales</label
									>
									<textarea
										id="reconocimientosIndividuales"
										v-model="form.camposEspecificos.reconocimientosIndividuales"
										rows="2"
										class="reg-input resize-none"></textarea>
								</div>
								<div class="reg-field sm:col-span-2">
									<label for="estadisticasUltimaTemporada" class="reg-label"
										>Estadísticas de la última temporada</label
									>
									<textarea
										id="estadisticasUltimaTemporada"
										v-model="form.camposEspecificos.estadisticasUltimaTemporada"
										rows="2"
										class="reg-input resize-none"></textarea>
								</div>
								<div class="reg-field sm:col-span-2">
									<label for="convocatoriasSelecciones" class="reg-label"
										>Convocatorias/selecciones</label
									>
									<textarea
										id="convocatoriasSelecciones"
										v-model="form.camposEspecificos.convocatoriasSelecciones"
										rows="2"
										class="reg-input resize-none"></textarea>
								</div>
							</div>
						</div>

						<!-- Campos específicos de Boxeo (FR-50) -->
						<div v-else-if="deporteSeleccionadoNombre === 'Boxeo'">
							<div class="mb-4 border-b border-neutral-700 pb-2 font-display text-3xl leading-none font-extrabold text-white uppercase">Perfil de boxeo</div>
							<div class="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
								<div class="reg-field">
									<label for="categoriaPeso" class="reg-label">Categoría de peso</label>
									<select id="categoriaPeso" v-model="form.camposEspecificos.categoriaPeso" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="c in BOXEO_CATEGORIAS_PESO" :key="c" :value="c">{{ c }}</option>
									</select>
								</div>
								<div class="reg-field">
									<label for="guardia" class="reg-label">Guardia</label>
									<select id="guardia" v-model="form.camposEspecificos.guardia" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="g in BOXEO_GUARDIA" :key="g" :value="g">{{ g }}</option>
									</select>
								</div>
								<div class="reg-field">
									<label for="gimnasioClubEntrenador" class="reg-label">Gimnasio/club y entrenador</label>
									<input
										id="gimnasioClubEntrenador"
										v-model="form.camposEspecificos.gimnasioClubEntrenador"
										type="text"
										class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="estiloPelea" class="reg-label">Estilo de pelea</label>
									<select id="estiloPelea" v-model="form.camposEspecificos.estiloPelea" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="e in BOXEO_ESTILO" :key="e" :value="e">{{ e }}</option>
									</select>
								</div>
								<div class="reg-field">
									<label for="modalidad" class="reg-label">Modalidad</label>
									<select id="modalidad" v-model="form.camposEspecificos.modalidad" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="m in BOXEO_MODALIDAD" :key="m" :value="m">{{ m }}</option>
									</select>
								</div>
								<div class="reg-field">
									<label for="record" class="reg-label">Récord</label>
									<input id="record" v-model="form.camposEspecificos.record" type="text" class="reg-input" />
								</div>
								<div class="reg-field sm:col-span-2">
									<label for="federacionLiga" class="reg-label"
										>Federación/liga u organismo sancionador</label
									>
									<input id="federacionLiga" v-model="form.camposEspecificos.federacionLiga" type="text" class="reg-input" />
								</div>
								<div class="reg-field sm:col-span-2">
									<label for="convocatoriasLogrosRankings" class="reg-label"
										>Convocatorias/logros/rankings</label
									>
									<textarea
										id="convocatoriasLogrosRankings"
										v-model="form.camposEspecificos.convocatoriasLogrosRankings"
										rows="2"
										class="reg-input resize-none"></textarea>
								</div>
							</div>
						</div>

						<!-- Deporte "Otros": permite indicar cuál deporte practica (FR-50) -->
						<div v-else-if="deporteSeleccionadoNombre === 'Otros'">
							<div class="mb-4 border-b border-neutral-700 pb-2 font-display text-3xl leading-none font-extrabold text-white uppercase">Detalle del deporte</div>
							<div class="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
								<div class="reg-field sm:col-span-2">
									<label for="nombreDeporte" class="reg-label"
										>¿Qué deporte practicas? <span class="text-neutral-400">(opcional)</span></label
									>
									<input
										id="nombreDeporte"
										v-model="form.camposEspecificos.nombreDeporte"
										type="text"
										placeholder="Ej: Ajedrez, Tenis, Atletismo…"
										class="reg-input" />
								</div>
							</div>
						</div>
					</template>

					<!-- Marca -->
					<template v-else-if="tipoSeleccionado === 'Marca'">
						<div>
							<div class="mb-4 border-b border-neutral-700 pb-2 font-display text-3xl leading-none font-extrabold text-white uppercase">Datos de la empresa</div>
							<div class="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
								<div class="reg-field">
									<label for="nombreComercial" class="reg-label">Nombre de la empresa</label>
									<input id="nombreComercial" v-model="form.nombreComercial" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="nit" class="reg-label">NIT</label>
									<input id="nit" v-model="form.nit" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="telefonoMarca" class="reg-label">Teléfono de contacto</label>
									<input id="telefonoMarca" v-model="form.telefono" type="tel" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="direccionContacto" class="reg-label">Dirección</label>
									<input id="direccionContacto" v-model="form.direccionContacto" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="nombreContacto" class="reg-label">Nombre del contacto</label>
									<input id="nombreContacto" v-model="form.nombreContacto" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="cargoContacto" class="reg-label">Cargo del contacto</label>
									<input id="cargoContacto" v-model="form.cargoContacto" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="redSocialUrl" class="reg-label">URL de red social</label>
									<input id="redSocialUrl" v-model="form.redSocialUrl" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="sitioWebMarca" class="reg-label">URL del aplicativo web</label>
									<input id="sitioWebMarca" v-model="form.sitioWeb" type="text" class="reg-input" />
								</div>
								<div class="reg-field sm:col-span-2">
									<label for="bioMarca" class="reg-label">Descripción de la empresa</label>
									<textarea id="bioMarca" v-model="form.bio" rows="3" class="reg-input"></textarea>
								</div>
							</div>
						</div>
					</template>

					<!-- Nutricionista -->
					<template v-else-if="tipoSeleccionado === 'Nutricionista'">
						<div>
							<div class="mb-4 border-b border-neutral-700 pb-2 font-display text-3xl leading-none font-extrabold text-white uppercase">Datos personales</div>
							<div class="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
								<div class="reg-field">
									<label for="nombresNutri" class="reg-label">Nombres</label>
									<input id="nombresNutri" v-model="form.nombres" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="apellidosNutri" class="reg-label">Apellidos</label>
									<input id="apellidosNutri" v-model="form.apellidos" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="fechaNacimientoNutri" class="reg-label">Fecha de nacimiento</label>
									<input id="fechaNacimientoNutri" v-model="form.fechaNacimiento" type="date" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="generoNutri" class="reg-label">Género</label>
									<select id="generoNutri" v-model="form.genero" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="g in GENEROS" :key="g" :value="g">{{ g }}</option>
									</select>
								</div>
								<div class="reg-field">
									<label for="telefonoNutri" class="reg-label">Teléfono</label>
									<input id="telefonoNutri" v-model="form.telefono" type="tel" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="paisNutri" class="reg-label">País</label>
									<select id="paisNutri" v-model="form.pais" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="p in PAISES" :key="p" :value="p">{{ p }}</option>
									</select>
								</div>
								<div class="reg-field">
									<label for="ciudadNutri" class="reg-label">Ciudad de residencia</label>
									<input id="ciudadNutri" v-model="form.ciudadResidencia" type="text" class="reg-input" />
								</div>
								<div class="reg-field sm:col-span-2">
									<label for="bioNutri" class="reg-label">Descripción corta</label>
									<textarea id="bioNutri" v-model="form.bio" rows="3" class="reg-input"></textarea>
								</div>
							</div>
						</div>
						<div>
							<div class="mb-4 border-b border-neutral-700 pb-2 font-display text-3xl leading-none font-extrabold text-white uppercase">Perfil profesional</div>
							<div class="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
								<div class="reg-field">
									<label for="profesion" class="reg-label">Título profesional</label>
									<input id="profesion" v-model="form.profesion" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="universidad" class="reg-label">Universidad donde estudió</label>
									<input id="universidad" v-model="form.universidad" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="anoGraduacion" class="reg-label">Año de graduación</label>
									<input id="anoGraduacion" v-model="form.anoGraduacion" type="number" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="especialidad" class="reg-label">Especialidad</label>
									<input id="especialidad" v-model="form.especialidad" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="anosExperiencia" class="reg-label">Años de experiencia</label>
									<input id="anosExperiencia" v-model="form.anosExperiencia" type="number" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="modalidadAtencion" class="reg-label">Modalidad de atención</label>
									<select id="modalidadAtencion" v-model="form.modalidadAtencion" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="m in MODALIDADES" :key="m" :value="m">{{ m }}</option>
									</select>
								</div>
								<div class="reg-field">
									<label for="certificadosAdicionales" class="reg-label"
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
							<div class="mb-4 border-b border-neutral-700 pb-2 font-display text-3xl leading-none font-extrabold text-white uppercase">Datos personales</div>
							<div class="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
								<div class="reg-field">
									<label for="nombresPatro" class="reg-label">Nombres</label>
									<input id="nombresPatro" v-model="form.nombres" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="apellidosPatro" class="reg-label">Apellidos</label>
									<input id="apellidosPatro" v-model="form.apellidos" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="fechaNacimientoPatro" class="reg-label">Fecha de nacimiento</label>
									<input id="fechaNacimientoPatro" v-model="form.fechaNacimiento" type="date" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="telefonoPatro" class="reg-label">Teléfono</label>
									<input id="telefonoPatro" v-model="form.telefono" type="tel" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="paisPatro" class="reg-label">País</label>
									<select id="paisPatro" v-model="form.pais" class="reg-input">
										<option value="">Selecciona…</option>
										<option v-for="p in PAISES" :key="p" :value="p">{{ p }}</option>
									</select>
								</div>
								<div class="reg-field">
									<label for="ciudadPatro" class="reg-label">Ciudad</label>
									<input id="ciudadPatro" v-model="form.ciudadResidencia" type="text" class="reg-input" />
								</div>
								<div class="reg-field">
									<label for="sitioWebPatro" class="reg-label"
										>Sitio web <span class="text-neutral-400">(opcional)</span></label
									>
									<input id="sitioWebPatro" v-model="form.sitioWeb" type="text" class="reg-input" />
								</div>
								<div class="reg-field sm:col-span-2">
									<label for="bioPatro" class="reg-label">Descripción breve</label>
									<textarea id="bioPatro" v-model="form.bio" rows="3" class="reg-input"></textarea>
								</div>
							</div>
						</div>
					</template>

					<label for="aceptaTerminos" class="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-700 p-4 transition-colors hover:border-neutral-400 has-[:checked]:border-primary-dark">
						<input id="aceptaTerminos" v-model="form.aceptaTerminos" type="checkbox" required class="mt-0.5 h-5 w-5 rounded border-neutral-500 bg-neutral-900 text-primary focus:ring-primary-dark" />
						<span class="text-neutral-100">
							Acepto los
							<NuxtLink to="/terms" target="_blank" class="font-semibold text-primary-dark underline underline-offset-2">términos y condiciones</NuxtLink>
							de Elite Hub.
						</span>
					</label>

					<p v-if="error || authStore.error" role="alert" class="flex items-start gap-2.5 rounded-md border-l-4 border-destructive-dark bg-destructive-dark/15 px-4 py-3 font-semibold text-white">
						<Icon name="fa6-solid:circle-exclamation" aria-hidden="true" class="mt-1 shrink-0 text-destructive-dark" />
						{{ error || authStore.error }}
					</p>

					<button
						type="submit"
						:disabled="isLoading || !form.tipoUsuarioId"
						class="button-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-lg font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white">
						<Icon v-if="isLoading" name="fa6-solid:spinner" aria-hidden="true" class="animate-spin motion-reduce:animate-none" />
						{{ isLoading ? "Creando tu cuenta…" : "Crear cuenta" }}
					</button>

					<p class="text-center text-neutral-300">
						¿Ya tienes una cuenta?
						<NuxtLink to="/login" class="font-semibold text-primary-dark hover:underline">Inicia sesión</NuxtLink>
					</p>
				</form>
			</div>

			<!-- Panel de marca: la ficha del directorio se va llenando con lo que la persona escribe -->
			<aside class="hidden bg-primary p-8 text-on-primary lg:block xl:p-12" aria-label="Vista previa de tu ficha">
				<div class="sticky top-8">
					<p class="font-display text-7xl leading-[0.85] font-extrabold uppercase xl:text-8xl">Elite Hub</p>
					<p class="mt-4 text-lg">Así se verá tu ficha en el directorio. Se llena mientras escribes.</p>

					<div class="group mt-6 w-full max-w-[17rem] overflow-hidden rounded-lg bg-white text-black shadow-xl transition duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl motion-reduce:transition-none motion-reduce:hover:translate-y-0" aria-live="off">
						<div class="relative flex aspect-[4/5] items-end bg-black text-white">
							<span class="px-4 pb-2 font-display text-9xl leading-[0.9] font-extrabold uppercase">{{ ficha.iniciales }}</span>
							<span v-if="ficha.nivel" class="absolute top-3 left-4 rounded-sm bg-dorsal px-2 py-0.5 text-[0.8125rem] font-semibold text-on-dorsal">
								{{ ficha.nivel }}
							</span>
						</div>
						<div class="border-t-4 border-transparent px-4 pt-3.5 pb-4 transition-colors duration-150 group-hover:border-primary motion-reduce:transition-none">
							<p class="font-display text-[1.75rem] leading-[0.95] font-extrabold break-words uppercase" :class="{ 'text-neutral-400': !ficha.tieneNombre }">
								{{ ficha.nombre }}
							</p>
							<p class="mt-1.5 font-semibold text-primary">{{ ficha.destacado }}</p>
							<p v-if="ficha.detalle" class="mt-1 text-sm text-neutral-600">{{ ficha.detalle }}</p>
						</div>
					</div>

					<p class="mt-8 font-semibold">Con tu cuenta podrás:</p>
					<ul class="mt-3 space-y-2">
						<li v-for="b in ficha.beneficios" :key="b" class="flex items-start gap-2.5">
							<Icon name="fa6-solid:check" aria-hidden="true" class="mt-1 shrink-0" />
							<span>{{ b }}</span>
						</li>
					</ul>
				</div>
			</aside>
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
const MODALIDADES = ["PRESENCIAL", "VIRTUAL", "VIRTUAL/PRESENCIAL"];

// Icono y frase de cada tipo de perfil en el selector inicial.
const TIPO_INFO: Record<string, { icon: string; texto: string }> = {
	Deportista: { icon: "fa6-solid:person-running", texto: "Muestra tu perfil, tu deporte y tu nivel." },
	Marca: { icon: "fa6-solid:tag", texto: "Publica tus productos y servicios." },
	Nutricionista: { icon: "fa6-solid:apple-whole", texto: "Ofrece tu asesoría y recibe reseñas." },
	Patrocinador: { icon: "fa6-solid:handshake", texto: "Encuentra talento para apoyar." },
};

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
	camposEspecificos: {},
});

const tipoSeleccionado = computed(() => tiposUsuario.value.find((t) => t.id === form.tipoUsuarioId)?.tipo ?? null);

const deportesFocales = computed(() =>
	DEPORTES_ENFOCADOS.map((nombre) => deportes.value.find((d) => d.nombre === nombre)).filter(Boolean),
);
const deporteSeleccionadoNombre = computed(() => deportes.value.find((d) => d.id === form.deporteId)?.nombre ?? null);

const BENEFICIOS: Record<string, string[]> = {
	Deportista: ["Aparecer en el directorio de deportistas", "Compartir fotos y videos de tus entrenamientos", "Enterarte de eventos y noticias"],
	Marca: ["Aparecer en el directorio de marcas", "Publicar tus productos y servicios en el catálogo", "Compartir novedades con la comunidad"],
	Nutricionista: ["Aparecer en el directorio de nutricionistas", "Recibir reseñas de quienes asesoras", "Compartir publicaciones con la comunidad"],
	Patrocinador: ["Aparecer en el directorio de patrocinadores", "Explorar los perfiles de los deportistas", "Enterarte de eventos y noticias"],
};

// Vista previa de la ficha en el panel verde: toma lo que ya se escribió en el formulario.
const ficha = computed(() => {
	const tipo = tipoSeleccionado.value ?? "";
	const limpio = (v: unknown) => String(v ?? "").trim();
	const capital = (v: string) => (v ? v.charAt(0) + v.slice(1).toLowerCase() : "");

	let nombre = "";
	let destacado = tipo;
	let nivel = "";
	const detalle: string[] = [];

	if (tipo === "Deportista") {
		nombre = `${limpio(form.primerNombre)} ${limpio(form.primerApellido)}`.trim();
		destacado = deporteSeleccionadoNombre.value || tipo;
		nivel = capital(limpio(form.nivel));
	} else if (tipo === "Marca") {
		nombre = limpio(form.nombreComercial);
	} else {
		nombre = `${limpio(form.nombres)} ${limpio(form.apellidos)}`.trim();
		if (tipo === "Nutricionista") destacado = limpio(form.especialidad) || tipo;
	}
	if (tipo !== "Marca" && limpio(form.ciudadResidencia)) detalle.push(limpio(form.ciudadResidencia));

	const palabras = nombre.split(/\s+/).filter(Boolean);
	const iniciales = (tipo === "Marca" ? nombre.slice(0, 2) : palabras.slice(0, 2).map((w) => w.charAt(0)).join("")).toUpperCase();

	return {
		tieneNombre: !!nombre,
		nombre: nombre || (tipo === "Marca" ? "Nombre de tu marca" : "Tu nombre"),
		iniciales: iniciales || "EH",
		destacado,
		nivel,
		detalle: detalle.join(", "),
		beneficios: BENEFICIOS[tipo] ?? [],
	};
});

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
/* El registro vive sobre el panel negro en ambos temas: campos oscuros con borde, verde al enfocar. */
.reg-field {
	display: flex;
	min-width: 0;
	flex-direction: column;
	gap: 0.375rem;
}
.reg-label {
	font-size: 0.875rem;
	font-weight: 600;
	color: #e5e5e5;
	transition: color 150ms;
}
.reg-field:focus-within > .reg-label {
	color: var(--color-primary-dark);
}
.reg-label:has(+ .reg-input:required)::after {
	content: " *";
	color: var(--color-destructive-dark);
}
.reg-input {
	width: 100%;
	border-radius: 0.375rem;
	border: 1px solid #525252;
	background: #171717;
	padding: 0.625rem 0.875rem;
	font-size: 1rem;
	color: #ffffff;
	color-scheme: dark;
	transition:
		border-color 150ms,
		box-shadow 150ms;
}
.reg-input::placeholder {
	color: #a3a3a3;
}
.reg-input:hover {
	border-color: #a3a3a3;
}
.reg-input:focus {
	border-color: var(--color-primary-dark);
	outline: none;
	box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-dark) 35%, transparent);
}
</style>
