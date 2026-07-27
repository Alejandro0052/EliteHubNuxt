export type ResourceType = "evento_noticia" | "catalogo_item" | "publicacion" | "resena";
export type ResourceAction = "edit" | "delete";

interface PermissionRule {
	authorAllowed: boolean;
	adminAllowed: boolean;
}

const MATRIX: Record<ResourceType, Record<ResourceAction, PermissionRule>> = {
	evento_noticia: {
		edit: { authorAllowed: true, adminAllowed: true },
		delete: { authorAllowed: true, adminAllowed: true },
	},
	catalogo_item: {
		edit: { authorAllowed: true, adminAllowed: true },
		delete: { authorAllowed: true, adminAllowed: true },
	},
	publicacion: {
		edit: { authorAllowed: true, adminAllowed: false },
		delete: { authorAllowed: true, adminAllowed: true },
	},
	resena: {
		edit: { authorAllowed: true, adminAllowed: false },
		delete: { authorAllowed: true, adminAllowed: true },
	},
};

export function canPerformAction(
	resourceType: ResourceType,
	action: ResourceAction,
	resource: { autorId: number | null | undefined },
	actor: { id: number; isAdmin: boolean },
): boolean {
	const rule = MATRIX[resourceType][action];
	if (actor.isAdmin && rule.adminAllowed) return true;
	if (rule.authorAllowed && resource.autorId === actor.id) return true;
	return false;
}
