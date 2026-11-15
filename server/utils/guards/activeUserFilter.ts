export function activeUserFilter(
	relation: string | null = null,
	options: { bypassForAdmin?: boolean; isAdmin?: boolean } = {},
): Record<string, any> {
	if (options.bypassForAdmin && options.isAdmin) return {};

	const condition = { activo: true };
	return relation ? { [relation]: condition } : condition;
}
