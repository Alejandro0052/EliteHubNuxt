<template>
	<div>
		<div v-if="initialLoading" :class="gridClass">
			<div v-for="n in 8" :key="n" :class="[skeletonClass, 'animate-pulse rounded-lg bg-surface-container-high motion-reduce:animate-none dark:bg-surface-container-high-dark']"></div>
		</div>

		<div v-else-if="items.length === 0">
			<slot name="empty" />
		</div>

		<template v-else>
			<div :class="gridClass">
				<slot v-for="item in items" :key="itemKey(item)" :item="item" />
			</div>
			<div ref="sentinel" aria-live="polite" class="py-8 text-center text-sm text-on-surface-variant dark:text-on-surface-variant-dark">
				{{ finished ? "Eso es todo por ahora." : loading ? "Cargando más resultados" : "" }}
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	fetchPage: (cursor: number | null) => Promise<{ items: any[]; nextCursor: number | null }>;
	itemKey?: (item: any) => string | number;
	gridClass?: string;
	skeletonClass?: string;
}>();

const itemKey = props.itemKey ?? ((item: any) => item.id);
const gridClass = props.gridClass ?? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

const skeletonClass = props.skeletonClass ?? "h-48";

const { items, loading, initialLoading, finished, error, loadMore } = useInfiniteScroll(props.fetchPage);

const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(() => {
	loadMore();

	observer = new IntersectionObserver((entries) => {
		if (entries[0]?.isIntersecting) {
			loadMore();
		}
	});

	watch(sentinel, (el) => {
		if (el && observer) observer.observe(el);
	});
});

onBeforeUnmount(() => {
	observer?.disconnect();
});
</script>
