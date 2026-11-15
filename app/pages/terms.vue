<template>
	<div class="min-h-screen w-full bg-surface-container dark:bg-surface-container-dark">
		<div class="max-w-page-shell mx-auto px-4 pt-8 pb-16 sm:px-6 lg:px-8">
			<ContentEditor page="terms" :initial-content="pageContent" @updated="handleContentUpdate" />

			<DirectoryHeader :title="pageContent.title || 'Términos y condiciones'" :subtitle="pageContent.subtitle || 'Última actualización: ' + lastUpdated" />

			<div v-if="pageContent.content" class="rich-text mt-10" v-html="pageContent.content"></div>
			<div v-else class="rich-text mt-10">
					<h2>1. Aceptación de los Términos</h2>
					<p>
						Al acceder y utilizar EliteHub, usted acepta estar sujeto a estos términos y condiciones
						de uso. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar
						nuestro servicio.
					</p>

					<h2>2. Descripción del Servicio</h2>
					<p>
						EliteHub es una plataforma digital que conecta deportistas, patrocinadores, marcas
						deportivas y nutricionistas especializados. Facilitamos el intercambio de servicios,
						productos y conocimientos en el ámbito deportivo.
					</p>

					<h2>3. Registro de Usuario</h2>
					<p>
						Para utilizar ciertos servicios de EliteHub, debe registrarse y crear una cuenta. Usted
						es responsable de:
					</p>
					<ul>
						<li>Proporcionar información precisa y actualizada</li>
						<li>Mantener la confidencialidad de su contraseña</li>
						<li>Notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
						<li>Ser responsable de todas las actividades que ocurran bajo su cuenta</li>
					</ul>

					<h2>4. Uso Aceptable</h2>
					<p>Al utilizar EliteHub, usted se compromete a:</p>
					<ul>
						<li>Utilizar el servicio solo para fines legales y legítimos</li>
						<li>No violar ninguna ley local, estatal, nacional o internacional</li>
						<li>No transmitir contenido ofensivo, difamatorio o inapropiado</li>
						<li>No interferir con el funcionamiento del servicio</li>
						<li>Respetar los derechos de propiedad intelectual</li>
					</ul>

					<h2>5. Contenido del Usuario</h2>
					<p>
						Usted retiene todos los derechos sobre el contenido que publique en EliteHub. Sin
						embargo, al publicar contenido, nos otorga una licencia no exclusiva para usar, mostrar
						y distribuir dicho contenido en nuestra plataforma.
					</p>

					<h2>6. Privacidad y Protección de Datos</h2>
					<p>
					 	Su privacidad es importante para nosotros. El uso de sus datos personales se rige por
						nuestra Política de Privacidad, que forma parte integral de estos términos.
					</p>

					<h2>7. Servicios de Terceros</h2>
					<p>
						EliteHub puede contener enlaces a sitios web o servicios de terceros. No somos
						responsables del contenido, políticas de privacidad o prácticas de estos sitios
						externos.
					</p>

					<h2>8. Limitación de Responsabilidad</h2>
					<p>
						EliteHub se proporciona "tal como está" sin garantías de ningún tipo. No seremos
						responsables de daños directos, indirectos, incidentales o consecuentes que resulten del
						uso de nuestro servicio.
					</p>

					<h2>9. Modificaciones del Servicio</h2>
					<p>
						Nos reservamos el derecho de modificar, suspender o discontinuar cualquier parte del
						servicio en cualquier momento, con o sin previo aviso.
					</p>

					<h2>10. Terminación</h2>
					<p>
						Podemos terminar o suspender su cuenta inmediatamente, sin previo aviso, por cualquier
						motivo, incluyendo la violación de estos términos.
					</p>

					<h2>11. Ley Aplicable</h2>
					<p>
						Estos términos se rigen por las leyes de Colombia. Cualquier disputa será resuelta en
						los tribunales competentes de Colombia.
					</p>

					<h2>12. Cambios en los Términos</h2>
					<p>
						Nos reservamos el derecho de actualizar estos términos en cualquier momento. Los cambios
						entrarán en vigor inmediatamente después de su publicación en esta página.
					</p>

					<h2>13. Contacto</h2>
					<p>
						Si tiene preguntas sobre estos términos y condiciones, puede contactarnos a través de:
					</p>
					<ul>
						<li>Email: legal@elitehub.com</li>
						<li>Teléfono: +57 (1) 234-5678</li>
						<li>Dirección: Calle 123 #45-67, Bogotá, Colombia</li>
					</ul>
			</div>
		</div>
	</div>
</template>

<script setup>
	definePageMeta({
		auth: false,
		title: "Términos y Condiciones - EliteHub",
		description: "Términos y condiciones de uso de la plataforma EliteHub",
	});

	const { getContent } = useContent();

	const pageContent = ref({
		title: "",
		subtitle: "",
		content: "",
		metadata: {},
	});

	const lastUpdated = ref("enero de 2024");

	const handleContentUpdate = (updatedContent) => {
		pageContent.value = updatedContent;
	};

	// Load content on mount
	onMounted(async () => {
		try {
			const content = await getContent("terms");
			pageContent.value = content;
		} catch (error) {
			console.error("Error loading content:", error);
		}
	});
</script>

<style scoped></style>
