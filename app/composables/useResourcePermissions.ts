import { canPerformAction, type ResourceType } from "#shared/utils/resourcePermissions";

export function useResourcePermissions(
	resourceType: ResourceType,
	resource: Ref<{ autorId: number | null | undefined } | null | undefined>,
) {
	const authStore = useAuthStore();

	const canEdit = computed(() => {
		const r = resource.value;
		const u = authStore.user;
		if (!r || !u) return false;
		return canPerformAction(resourceType, "edit", r, { id: u.id, isAdmin: !!u.isAdmin });
	});

	const canDelete = computed(() => {
		const r = resource.value;
		const u = authStore.user;
		if (!r || !u) return false;
		return canPerformAction(resourceType, "delete", r, { id: u.id, isAdmin: !!u.isAdmin });
	});

	const canRetract = computed(() => false);

	return { canEdit, canDelete, canRetract };
}
