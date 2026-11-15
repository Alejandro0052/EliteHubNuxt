export default defineAppConfig({
	ui: {
		// Mapped to this project's existing brand hex values (main.css @theme block),
		// which already match Tailwind's stock palette exactly: --color-primary (#15803d)
		// is green-700, --color-secondary (#1e293b) is slate-800, --color-destructive
		// (#dc2626) is red-600 -- so these aliases line up with the brand with zero
		// custom color-ramp work.
		colors: {
			primary: "green",
			secondary: "slate",
			error: "red",
			neutral: "slate",
		},
	},
});
