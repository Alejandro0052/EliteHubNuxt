import { canPerformAction, type ResourceType, type ResourceAction } from "#shared/utils/resourcePermissions";

export function authorOrAdmin(
	resourceType: ResourceType,
	action: ResourceAction,
	resource: { autorId: number | null | undefined },
	session: { id: number; isAdmin: boolean },
): boolean {
	return canPerformAction(resourceType, action, resource, session);
}
