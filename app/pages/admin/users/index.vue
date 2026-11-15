<template>
	<div class="min-h-screen w-full bg-surface-container dark:bg-surface-container-dark">
		<div class="max-w-page-shell mx-auto px-4 pt-8 pb-16 sm:px-6 lg:px-8">
			<div class="mb-6 flex flex-wrap items-end justify-between gap-4 border-b-2 border-on-surface pb-4 dark:border-on-surface-dark">
				<h1 class="font-display text-5xl leading-[0.9] font-extrabold uppercase sm:text-6xl text-on-surface dark:text-on-surface-dark">Usuarios</h1>
				<div class="flex items-center gap-3">
					<NuxtLink to="/profile" class="button-secondary inline-flex items-center gap-2 px-4 py-2 font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
						<Icon name="fa6-solid:arrow-left" />
						Volver
					</NuxtLink>
					<NuxtLink to="/admin/users/create" class="button-primary inline-flex items-center gap-2 px-5 py-2.5 font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark">
						<Icon name="fa6-solid:user-plus" />
						Crear usuario
					</NuxtLink>
				</div>
			</div>

			<p v-if="loading" class="text-on-surface-variant dark:text-on-surface-variant-dark">Cargando usuarios…</p>
			<p v-else-if="users.length === 0" class="text-on-surface-variant dark:text-on-surface-variant-dark">Todavía no hay usuarios registrados.</p>
			<div v-else class="overflow-x-auto rounded-lg border border-border-hairline bg-surface dark:border-border-hairline-dark dark:bg-surface-container-dark">
				<table class="data-table">
					<thead>
						<tr>
							<th>Nombre</th>
							<th>Correo</th>
							<th>Tipo de usuario</th>
							<th>Rol</th>
							<th>Estado</th>
							<th>Creado</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="u in users" :key="u.id">
							<td class="font-semibold">{{ u.nombre }} {{ u.apellido }}</td>
							<td>{{ u.correo }}</td>
							<td>{{ u.informacion?.tipoUsuario?.tipo || "Sin tipo" }}</td>
							<td>{{ u.isAdmin ? "Administrador" : "Usuario" }}</td>
							<td>
								<button
									v-if="authStore.user?.isAdmin && u.id !== authStore.user.id"
									type="button"
									:aria-pressed="u.activo"
									:title="u.activo ? 'Desactivar usuario' : 'Activar usuario'"
									class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark"
									:class="estadoClass(u.activo)"
									@click="toggleActivo(u)">
									<Icon :name="u.activo ? 'fa6-solid:toggle-on' : 'fa6-solid:toggle-off'" />
									{{ u.activo ? "Activo" : "Inactivo" }}
								</button>
								<span v-else class="inline-flex rounded-full border px-3 py-1 text-sm font-semibold" :class="estadoClass(u.activo)">
									{{ u.activo ? "Activo" : "Inactivo" }}
								</span>
							</td>
							<td class="text-sm whitespace-nowrap tabular-nums text-on-surface-variant dark:text-on-surface-variant-dark">{{ formatDate(u.createdAt) }}</td>
							<td>
								<NuxtLink
									:to="`/profile/${u.id}`"
									class="inline-flex items-center gap-1.5 rounded text-sm font-semibold whitespace-nowrap text-primary underline-offset-2 hover:underline dark:text-primary-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dark:focus-visible:outline-primary-dark"
									title="Editar perfil (recuperación admin)">
									<Icon name="fa6-solid:pen" />
									Editar perfil
								</NuxtLink>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const { showToast } = useToast()
const users = ref<any[]>([])
const loading = ref(true)

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

function estadoClass(activo: boolean) {
  return activo
    ? 'border-primary text-primary dark:border-primary-dark dark:text-primary-dark'
    : 'border-destructive text-destructive dark:border-destructive-dark dark:text-destructive-dark'
}

async function toggleActivo(user: any) {
  const nuevoEstado = !user.activo
  try {
    await $fetch(`/api/admin/users/${user.id}/activo`, {
      method: 'PUT',
      body: { activo: nuevoEstado }
    })
    user.activo = nuevoEstado
  } catch (err) {
    showToast('No se pudo cambiar el estado: ' + (err?.data?.message || err?.message || 'Error desconocido'), 'error')
  }
}

onMounted(async () => {
  try {
    await authStore.checkAuth()
    users.value = await $fetch('/api/admin/users')
  } catch (err) {
    console.error('Failed to load users', err)
  } finally {
    loading.value = false
  }
})
</script>
