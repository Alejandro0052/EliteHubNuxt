<template>
	<div class="min-h-screen w-full bg-surface-container dark:bg-surface-container-dark">
		<div class="max-w-page-shell mx-auto px-4 pt-8 pb-16 sm:px-6 lg:px-8">
			<ContentEditor page="aboutUs" :initial-content="pageContent" @updated="handleContentUpdate" />

			<DirectoryHeader :title="pageContent.title || 'Quiénes somos'" :subtitle="pageContent.subtitle || 'Un punto de encuentro entre deportistas, profesionales de la salud, marcas y patrocinadores.'" />

			<div v-if="pageContent.content" class="rich-text mt-10" v-html="pageContent.content"></div>

			<template v-else>
				<section
					v-for="seccion in secciones"
					:key="seccion.titulo"
					class="grid gap-x-10 gap-y-3 border-b border-border-hairline py-8 md:grid-cols-[minmax(0,22rem)_1fr] dark:border-border-hairline-dark">
					<h2 class="font-display text-4xl leading-[0.95] font-extrabold uppercase sm:text-5xl text-on-surface dark:text-on-surface-dark">{{ seccion.titulo }}</h2>
					<p class="max-w-[70ch] text-lg text-pretty text-on-surface dark:text-on-surface-dark">{{ seccion.texto }}</p>
				</section>
				<NuxtLink to="/register" class="button-primary mt-8 inline-flex items-center gap-2 px-6 py-3 text-lg font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
					Crea tu cuenta
				</NuxtLink>
			</template>
		</div>
	</div>
</template>

<script lang="ts" setup>
	definePageMeta({
		auth: false,
		title: "Quiénes somos",
		description: "Conoce más sobre la plataforma EliteHub",
	});

	const secciones = [
		{ titulo: "Nuestra misión", texto: "Crear un espacio seguro, profesional y colaborativo donde los deportistas puedan conectar directamente con médicos especializados, nutricionistas, fisioterapeutas, entrenadores, marcas deportivas y patrocinadores, accediendo a oportunidades que impulsen su rendimiento y su carrera." },
		{ titulo: "Nuestra visión", texto: "Convertirnos en la plataforma líder en América Latina para la gestión integral del entorno deportivo, donde la tecnología facilite el encuentro entre quienes hacen posible el alto rendimiento: atletas comprometidos, profesionales de la salud, empresas del sector y patrocinadores con visión de impacto." },
		{ titulo: "Por qué Elite Hub", texto: "En el mundo del deporte, el talento no siempre es suficiente. Muchos atletas con gran potencial no logran avanzar por la falta de visibilidad, redes de apoyo médico, asesoría técnica o respaldo económico. Al mismo tiempo, existen marcas y patrocinadores en búsqueda de figuras con valores, constancia y comunidad activa, pero no siempre saben dónde encontrarlos. Elite Hub surge para cerrar esa brecha: ayudamos a los deportistas a profesionalizar su carrera, y brindamos a las marcas y profesionales las herramientas para encontrar talentos auténticos y comprometidos." },
		{ titulo: "Nuestra filosofía", texto: "En Elite Hub creemos en los vínculos genuinos. Sabemos que detrás de cada atleta hay esfuerzo, disciplina y sueños; detrás de cada marca, hay estrategia e identidad; y detrás de cada profesional, vocación de servicio. Por eso, más allá de una herramienta tecnológica, somos un punto de encuentro donde se tejen relaciones de valor y se construyen trayectorias con propósito." },
		{ titulo: "Comprometidos con el futuro del deporte", texto: "Cada conexión que se genera en Elite Hub está orientada a fortalecer el ecosistema deportivo. Nos apasiona ver cómo los deportistas alcanzan nuevas metas, cómo los profesionales aportan a su bienestar y cómo las marcas logran visibilidad a través del impacto social y el compromiso con el talento. Estamos en constante evolución, escuchando a nuestra comunidad y desarrollando nuevas funcionalidades para facilitar el crecimiento de todos nuestros usuarios." },
		{ titulo: "Únete a la comunidad", texto: "No importa si eres un atleta en formación, un profesional con experiencia, una marca emergente o un patrocinador consolidado: en Elite Hub hay un lugar para ti. Te invitamos a ser parte de una plataforma que cree en el deporte como motor de transformación, salud y oportunidades." },
	];

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

