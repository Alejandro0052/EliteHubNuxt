export type ToastType = "success" | "error";

export interface Toast {
	id: number;
	message: string;
	type: ToastType;
}

let nextId = 0;

export function useToast() {
	const toasts = useState<Toast[]>("toasts", () => []);

	function showToast(message: string, type: ToastType = "success", duration = 3000) {
		const id = nextId++;
		toasts.value.push({ id, message, type });
		setTimeout(() => {
			toasts.value = toasts.value.filter((t) => t.id !== id);
		}, duration);
	}

	function dismissToast(id: number) {
		toasts.value = toasts.value.filter((t) => t.id !== id);
	}

	return { toasts, showToast, dismissToast };
}
