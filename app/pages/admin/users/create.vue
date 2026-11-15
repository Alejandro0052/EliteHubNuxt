<template>
	<div class="min-h-screen w-full bg-surface-container dark:bg-surface-container-dark">
		<div class="mx-auto max-w-5xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
			<h1 class="form-title !mb-3">Crear usuario</h1>
			<p class="mb-8 max-w-[60ch] text-lg text-on-surface-variant dark:text-on-surface-variant-dark">Crea una cuenta en nombre de otra persona.</p>

			<p v-if="!authStore.user?.isAdmin" class="form-notice">
				<Icon name="fa6-solid:lock" aria-hidden="true" class="mt-1 shrink-0" />
				Solo los administradores pueden crear usuarios.
			</p>
			<form v-else class="form-sheet" @submit.prevent="handleSubmit">
				<p class="form-hint pt-6">Los campos con <span class="text-destructive dark:text-destructive-dark">*</span> son obligatorios.</p>
				<section class="form-section">
					<div>
						<h2 class="form-section-title">La cuenta</h2>
						<p class="form-hint mt-2">Con el correo y la contraseña la persona podrá iniciar sesión.</p>
					</div>
					<div class="form-grid">
						<div class="form-field">
							<label for="nombre" class="form-label">Nombre</label>
							<input id="nombre" v-model="nombre" type="text" class="form-control" required autocomplete="off" />
						</div>
						<div class="form-field">
							<label for="apellido" class="form-label">Apellido</label>
							<input id="apellido" v-model="apellido" type="text" class="form-control" required autocomplete="off" />
						</div>
						<div class="form-field">
							<label for="correo" class="form-label">Correo</label>
							<input id="correo" v-model="correo" type="email" class="form-control" required autocomplete="off" />
						</div>
						<div class="form-field">
							<label for="password" class="form-label">Contraseña</label>
							<input id="password" v-model="password" type="password" class="form-control" required autocomplete="new-password" />
						</div>
					</div>
				</section>

				<section class="form-section">
					<div>
						<h2 class="form-section-title">Permisos</h2>
						<p class="form-hint mt-2">Qué puede hacer la cuenta.</p>
					</div>
					<div class="form-grid">
						<div class="form-field">
							<label for="isAdmin" class="form-label">Rol</label>
							<select id="isAdmin" v-model="isAdmin" class="form-control">
								<option :value="false">Usuario</option>
								<option :value="true">Administrador</option>
							</select>
						</div>
						<div class="form-field">
							<span class="form-label">Estado</span>
							<label for="activo" class="form-check">
								<input id="activo" v-model="activo" type="checkbox" class="mt-0.5 h-5 w-5 rounded text-primary focus:ring-primary" />
								<span class="text-on-surface dark:text-on-surface-dark">Cuenta activa</span>
							</label>
						</div>
					</div>
				</section>

				<div class="form-actions">
					<p v-if="error" role="alert" class="form-alert form-alert-error mr-auto">
						<Icon name="fa6-solid:circle-exclamation" aria-hidden="true" class="mt-1 shrink-0 text-destructive dark:text-destructive-dark" />
						{{ error }}
					</p>
					<p v-if="success" role="status" class="form-alert form-alert-success mr-auto">
						<Icon name="fa6-solid:circle-check" aria-hidden="true" class="mt-1 shrink-0 text-primary dark:text-primary-dark" />
						Usuario creado.
					</p>
					<NuxtLink to="/admin/users" class="button-secondary form-submit focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">Cancelar</NuxtLink>
					<button type="submit" :disabled="loading" class="button-primary form-submit focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
						<Icon v-if="loading" name="fa6-solid:spinner" aria-hidden="true" class="animate-spin motion-reduce:animate-none" />
						{{ loading ? "Creando…" : "Crear usuario" }}
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const nombre = ref('')
const apellido = ref('')
const correo = ref('')
const password = ref('')
const isAdmin = ref(false)
const activo = ref(true)
const loading = ref(false)
const error = ref('')
const success = ref(false)

async function handleSubmit() {
  error.value = ''
  success.value = false
  if (!authStore.user?.isAdmin) {
    error.value = 'No autorizado'
    return
  }

  loading.value = true
  try {
    const res = await $fetch('/api/admin/users', {
      method: 'POST',
      body: { nombre: nombre.value, apellido: apellido.value, correo: correo.value, password: password.value, isAdmin: isAdmin.value, activo: activo.value }
    })
    success.value = true
    nombre.value = ''
    apellido.value = ''
    correo.value = ''
    password.value = ''
    isAdmin.value = false
    activo.value = true
  } catch (err: any) {
    console.error(err)
    error.value = err?.data?.message || err?.message || 'Error al crear usuario'
  } finally {
    loading.value = false
  }
}
</script>
