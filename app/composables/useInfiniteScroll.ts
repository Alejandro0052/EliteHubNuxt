export function useInfiniteScroll<T>(
	fetchPage: (cursor: number | null) => Promise<{ items: T[]; nextCursor: number | null }>,
) {
	const items = ref<T[]>([]) as Ref<T[]>;
	const cursor = ref<number | null>(null);
	const loading = ref(false);
	const initialLoading = ref(true);
	const finished = ref(false);
	const error = ref<string | null>(null);

	async function loadMore() {
		if (loading.value || finished.value) return;
		loading.value = true;
		error.value = null;
		try {
			const page = await fetchPage(cursor.value);
			items.value.push(...page.items);
			cursor.value = page.nextCursor;
			if (page.nextCursor === null) finished.value = true;
		} catch (e) {
			error.value = "Error al cargar resultados.";
		} finally {
			loading.value = false;
			initialLoading.value = false;
		}
	}

	return { items, loading, initialLoading, finished, error, loadMore };
}
