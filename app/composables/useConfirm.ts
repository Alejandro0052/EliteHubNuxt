export interface ConfirmOptions {
	title?: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
}

interface ConfirmState extends ConfirmOptions {
	open: boolean;
	resolve?: (value: boolean) => void;
}

export function useConfirm() {
	const state = useState<ConfirmState>("confirmDialog", () => ({
		open: false,
		message: "",
	}));

	function askConfirm(options: ConfirmOptions) {
		return new Promise<boolean>((resolve) => {
			state.value = { ...options, open: true, resolve };
		});
	}

	function respond(value: boolean) {
		state.value.resolve?.(value);
		state.value = { ...state.value, open: false, resolve: undefined };
	}

	return { state, askConfirm, respond };
}
