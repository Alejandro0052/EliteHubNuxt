<template>
	<div class="mx-auto max-w-[120rem] space-y-6 py-10 text-black">
		<!-- HERO -->
		<div class="flex flex-col gap-6 lg:h-[500px] lg:flex-row xl:h-[700px]">
			<div
				class="relative flex h-full min-h-[250px] w-full flex-1 overflow-hidden rounded-2xl lg:min-h-[350px] lg:w-2/3 xl:min-h-[400px]">
				<video
					class="h-full min-h-[250px] w-full object-cover md:min-h-[350px] xl:min-h-[400px]"
					autoplay
					loop
					muted
					src="/videoplayback.webm"></video>
				<div class="absolute inset-0 bg-black/40"></div>
				<div class="absolute inset-8 flex items-end">
					<div class="space-y-2 text-white md:space-y-6">
						<h1 class="text-xl sm:text-4xl xl:text-7xl">
							Más que una red, una comunidad deportiva.
						</h1>
						<h2 class="text-sm sm:text-xl xl:text-2xl">Conecta. Entrena. Crece.</h2>
					</div>
				</div>
			</div>
			<div
				class="flex h-full w-full flex-col space-y-4 rounded-2xl bg-white px-8 py-10 lg:min-h-[350px] lg:w-1/3 xl:min-h-[400px]">
				<div class="space-y-2">
					<h1 class="text-3xl font-semibold">Bienvenido a Elite Hub</h1>
					<p class="text-pretty text-gray-600">
						La red social donde deportistas, nutricionistas, patrocinadores y marcas pueden
						conectarse y crear nuevas oportunidades.
					</p>
				</div>
				<div class="flex flex-col gap-4 overflow-y-auto xl:max-h-[500px]">
					<NuxtLink to="/deportistas">
						<div
							class="group flex items-center justify-between rounded-xl border border-black p-6 transition-all duration-300 hover:bg-black">
							<div>
								<h2 class="text-xl font-semibold group-hover:text-white">Deportistas</h2>
								<p class="text-gray-600 group-hover:text-gray-400">Conoce nuestros deportistas</p>
							</div>
							<div
								class="flex rounded-full bg-black p-4 text-xl text-white group-hover:bg-white group-hover:text-black">
								<Icon name="fa6-solid:person-running" />
							</div>
						</div>
					</NuxtLink>
					<NuxtLink to="/patrocinadores">
						<div
							class="group flex items-center justify-between rounded-xl border border-black p-6 transition-all duration-300 hover:bg-black">
							<div>
								<h2 class="text-xl font-semibold group-hover:text-white">Patrocinadores</h2>
								<p class="text-gray-600 group-hover:text-gray-400">
									Conoce nuestros patrocinadores
								</p>
							</div>
							<div
								class="flex rounded-full bg-black p-4 text-xl text-white group-hover:bg-white group-hover:text-black">
								<Icon name="fa6-solid:chart-line" />
							</div>
						</div>
					</NuxtLink>
					<NuxtLink to="/marcas">
						<div
							class="group flex items-center justify-between rounded-xl border border-black p-6 transition-all duration-300 hover:bg-black">
							<div>
								<h2 class="text-xl font-semibold group-hover:text-white">Marcas</h2>
								<p class="text-gray-600 group-hover:text-gray-400">Conoce nuestras marcas</p>
							</div>
							<div
								class="flex rounded-full bg-black p-4 text-xl text-white group-hover:bg-white group-hover:text-black">
								<Icon name="fa6-solid:handshake" />
							</div>
						</div>
					</NuxtLink>
					<NuxtLink to="/nutricionistas">
						<div
							class="group flex items-center justify-between rounded-xl border border-black p-6 transition-all duration-300 hover:bg-black">
							<div>
								<h2 class="text-xl font-semibold group-hover:text-white">Nutricionistas</h2>
								<p class="text-gray-600 group-hover:text-gray-400">
									Conoce nuestras nutricionistas
								</p>
							</div>
							<div
								class="flex rounded-full bg-black p-4 text-xl text-white group-hover:bg-white group-hover:text-black">
								<Icon name="fa6-solid:user-doctor" />
							</div>
						</div>
					</NuxtLink>
				</div>
			</div>
		</div>

		<!-- Estadísticas -->
		<div class="grid grid-cols-1 gap-6 text-black sm:grid-cols-2 lg:grid-cols-5">
			<stats :endValue="327" text="Deportistas" icon="fa6-solid:person-running"></stats>
			<stats :endValue="125" text="Patrocinadores" icon="fa6-solid:chart-line"></stats>
			<stats :endValue="62" text="Marcas" icon="fa6-solid:handshake"></stats>
			<stats :endValue="86" text="Nutricionistas" icon="fa6-solid:user-doctor"></stats>
			<stats :endValue="51" text="Eventos" icon="fa6-solid:trophy"></stats>
		</div>

		<!-- Noticias -->
		<div>
			<div class="flex flex-col justify-between gap-4 py-12 md:flex-row md:items-center">
				<h2 class="text-6xl text-white">Noticias</h2>
				<NuxtLink to="/">
					<div class="group flex items-center gap-2">
						<div class="flex rounded-full bg-black p-4 text-white">
							<Icon name="fa6-solid:right-long"></Icon>
						</div>
						<h2
							class="text-2xl text-gray-400 underline-offset-4 group-hover:text-white group-hover:underline">
							Ver todas las noticias
						</h2>
					</div>
				</NuxtLink>
			</div>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<!-- <news
          href=""
          image="/Nutritionist.jpg"
          title="¡Ahora contamos con una amplia variedad de
					nutricionistas verificados!"
          content="Elite Hub sigue creciendo y ahora ofrece una
					selección diversa de nutricionistas certificados,
					incluyendo profesionales extranjeros, para atender a
					todo tipo de público. Todos nuestros expertos han
					sido verificados para garantizar la mejor calidad y
					confianza en cada consulta. ¡Descubre el
					acompañamiento ideal para tu bienestar, sin importar
					tu nivel o país de origen!"
          date="5 de marzo de 2025"
        ></news>
        <news
          href=""
          image="/alliance.jpg"
          title="Elite Hub logra alianza histórica entre marcas
				deportivas"
          content="Nos complace anunciar que Elite Hub ha facilitado
				una alianza estratégica entre reconocidas marcas
				deportivas, impulsando la innovación y el apoyo a
				los deportistas de nuestra comunidad. Esta
				colaboración permitirá el desarrollo de nuevos
				productos, eventos exclusivos y mayores
				oportunidades para todos los miembros de la
				plataforma. ¡Seguimos creciendo juntos y generando
				impacto positivo en el ecosistema deportivo!"
          date="10 de enero de 2025"
        ></news>
        <news
          href=""
          image="/logo.jpeg"
          title="Elite Hub anuncia la apertura de sus operaciones en el mercado nacional"
          content="Elite Hub es la red social líder dedicada a
				potenciar el ecosistema deportivo, conectando a
				deportistas, marcas, patrocinadores, médicos,
				nutricionistas y otros profesionales del sector.
				Nuestra plataforma facilita la creación de
				oportunidades únicas para el crecimiento profesional
				y personal, promoviendo la colaboración, el
				intercambio de conocimientos y el desarrollo de
				alianzas estratégicas. En Elite Hub, impulsamos el
				talento deportivo y fomentamos relaciones sólidas
				entre todos los actores del deporte, generando un
				espacio donde la innovación, el bienestar y el éxito
				se encuentran para transformar vidas y construir un
				futuro más saludable y conectado para la comunidad
				deportiva."
          date="20 de noviembre de 2024"
        ></news> -->
			</div>
		</div>

		<!-- Eventos -->
		<div>
			<div class="flex flex-col justify-between gap-4 py-12 md:flex-row md:items-center">
				<h2 class="text-6xl text-white">Eventos</h2>
				<NuxtLink to="/">
					<div class="group flex items-center gap-2">
						<div class="flex rounded-full bg-black p-4 text-white">
							<Icon name="fa6-solid:right-long"></Icon>
						</div>
						<h2
							class="text-2xl text-gray-400 underline-offset-4 group-hover:text-white group-hover:underline">
							Ver todos los eventos
						</h2>
					</div>
				</NuxtLink>
			</div>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<!-- <events
					image="/maraton.jpg"
					title="Maraton Cali - 2025"
					date="4 de mayo de 2025"
					time="5:00 A.M."
					></events> -->
			</div>
		</div>

		<!-- Testimonios -->
		<!-- <div v-if="carouselTestimonials.length > 0">
      <div
        class="flex flex-col justify-between gap-4 py-12 md:flex-row md:items-center"
      >
        <h2 class="text-6xl text-white">Testimonios</h2>
      </div>
      <app-testimonials [items]="carouselTestimonials"></app-testimonials>
    </div> -->
	</div>
</template>

<script setup lang="ts">
	definePageMeta({
		auth: false,
	});
</script>
