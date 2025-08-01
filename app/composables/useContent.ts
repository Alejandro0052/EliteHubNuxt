export const useContent = () => {
	const authStore = useAuthStore();

	const isAdmin = computed(() => {
		return authStore.user?.isAdmin || false;
	});

	const getContent = async (page: string) => {
		try {
			const { data: content } = await $fetch<any>(`/api/content/${page}`);
			return content;
		} catch (error) {
			console.error("Error fetching content:", error);
			return {
				page,
				title: "",
				subtitle: "",
				content: "",
				metadata: {},
			};
		}
	};

	const updateContent = async (page: string, contentData: any) => {
		try {
			const data = await $fetch(`/api/content/${page}`, {
				method: "PUT",
				body: contentData,
			});
			return data;
		} catch (error) {
			console.error("Error updating content:", error);
			throw error;
		}
	};

	return {
		isAdmin,
		getContent,
		updateContent,
	};
};
