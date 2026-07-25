<template>
	<div class="mx-auto min-h-screen py-10">
		<ContentEditor page="aboutUs" :initial-content="pageContent" @updated="handleContentUpdate" />

		<!-- Hero Section -->
		<section class="relative bg-black px-4 py-16 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-4xl text-center">
				<h1 class="mb-6 text-4xl font-bold text-white md:text-5xl">
					{{ pageContent.title || "¿Quienes Somos?" }}
				</h1>
				<p class="mb-8 text-lg text-gray-300 md:text-xl">
					{{
						pageContent.subtitle ||
						"EliteHub es mucho más que una plataforma digital. Somos un ecosistema de conexión, crecimiento y apoyo mutuo entre deportistas, profesionales de la salud, marcas y patrocinadores."
					}}
				</p>
			</div>
		</section>

		<!-- Main Content -->
		<section class="mx-auto max-w-[120rem] space-y-6 px-4 py-16 sm:px-6 lg:px-8">
		<div v-if="pageContent.content" class="rounded-xl bg-white p-8 text-gray-800 shadow-lg md:p-12">
			<div class="prose max-w-none" v-html="pageContent.content"></div>
		</div>

		<template v-else>
		<div class="flex flex-col gap-6 rounded-2xl bg-white p-6">
			<h1 class="text-3xl font-semibold">Nuestra Misión</h1>
			<p class="text-pretty">
				Crear un espacio seguro, profesional y colaborativo donde los deportistas puedan conectar
				directamente con médicos especializados, nutricionistas, fisioterapeutas, entrenadores,
				marcas deportivas y patrocinadores, accediendo a oportunidades que impulsen su rendimiento y
				su carrera.
			</p>
		</div>
		<div class="flex flex-col gap-6 rounded-2xl bg-white p-6">
			<h1 class="text-3xl font-semibold">Nuestra Visión</h1>
			<p class="text-pretty">
				Convertirnos en la plataforma líder en América Latina para la gestión integral del entorno
				deportivo, donde la tecnología facilite el encuentro entre quienes hacen posible el alto
				rendimiento: atletas comprometidos, profesionales de la salud, empresas del sector y
				patrocinadores con visión de impacto.
			</p>
		</div>
		<div class="flex flex-col gap-6 rounded-2xl bg-white p-6">
			<h1 class="text-3xl font-semibold">¿Por qué EliteHub?</h1>
			<p class="text-pretty">
				En el mundo del deporte, el talento no siempre es suficiente. Muchos atletas con gran
				potencial no logran avanzar por la falta de visibilidad, redes de apoyo médico, asesoría
				técnica o respaldo económico. Al mismo tiempo, existen marcas y patrocinadores en búsqueda
				de figuras con valores, constancia y comunidad activa, pero no siempre saben dónde
				encontrarlos. EliteHub surge para cerrar esa brecha: ayudamos a los deportistas a
				profesionalizar su carrera, y brindamos a las marcas y profesionales las herramientas para
				encontrar talentos auténticos y comprometidos.
			</p>
		</div>
		<div class="flex flex-col gap-6 rounded-2xl bg-white p-6">
			<h1 class="text-3xl font-semibold">Nuestra Filosofía</h1>
			<p class="text-pretty">
				En EliteHub creemos en los vínculos genuinos. Sabemos que detrás de cada atleta hay
				esfuerzo, disciplina y sueños; detrás de cada marca, hay estrategia e identidad; y detrás de
				cada profesional, vocación de servicio. Por eso, más allá de una herramienta tecnológica,
				somos un punto de encuentro donde se tejen relaciones de valor y se construyen trayectorias
				con propósito.
			</p>
		</div>
		<div class="flex flex-col gap-6 rounded-2xl bg-white p-6">
			<h1 class="text-3xl font-semibold">Comprometidos con el futuro del deporte</h1>
			<p class="text-pretty">
				Cada conexión que se genera en EliteHub está orientada a fortalecer el ecosistema deportivo.
				Nos apasiona ver cómo los deportistas alcanzan nuevas metas, cómo los profesionales aportan
				a su bienestar y cómo las marcas logran visibilidad a través del impacto social y el
				compromiso con el talento. Estamos en constante evolución, escuchando a nuestra comunidad y
				desarrollando nuevas funcionalidades para facilitar el crecimiento de todos nuestros
				usuarios.
			</p>
		</div>
		<div class="flex flex-col gap-6 rounded-2xl bg-white p-6">
			<div class="flex justify-between gap-4">
				<h1 class="text-3xl font-semibold">Únete a la comunidad EliteHub</h1>
				<NuxtLink to="/register">
					<div class="group flex items-center gap-2">
						<div class="flex rounded-full bg-black p-4 text-white">
							<Icon name="fa6-solid:right-long"></Icon>
						</div>
						<h2 class="text-2xl underline-offset-4 group-hover:underline">Registrate</h2>
					</div>
				</NuxtLink>
			</div>
			<p class="text-pretty">
				No importa si eres un atleta en formación, un profesional con experiencia, una marca
				emergente o un patrocinador consolidado: en EliteHub hay un lugar para ti. Te invitamos a
				ser parte de una plataforma que cree en el deporte como motor de transformación, salud y
				oportunidades.
			</p>
		</div>
		</template>
		</section>
	</div>
</template>

<script lang="ts" setup>
	definePageMeta({
		auth: false,
		title: "¿Quienes Somos?",
		description: "Conoce más sobre la plataforma EliteHub",
	});

	const { getContent } = useContent();

	const pageContent = ref({
		title: "",
		subtitle: "",
		content: "",
		metadata: {},
	});

	const handleContentUpdate = (updatedContent: any) => {
		pageContent.value = updatedContent;
	};

	onMounted(async () => {
		try {
			const content = await getContent("aboutUs");
			pageContent.value = content;
		} catch (error) {
			console.error("Error loading content:", error);
		}
	});
</script>

<style></style>
