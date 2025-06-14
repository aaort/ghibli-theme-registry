import { RegistryEntry } from "./scripts/schema";

const registry: RegistryEntry[] = [
	{
		name: "ghibli-theme",
		type: "registry:ui",

		// shadcn-ui components that this component depends on
		registryDependencies: ["button"],

		// npm dependencies that this component depends on
		dependencies: [],
		devDependencies: [],

		// Tailwind CSS config
		tailwind: {
			config: {},
		},

		// CSS variables
		cssVars: {},

		// Files that make up this component in your src/components/ui folder
		files: ["button.tsx"],
	},
];
export default registry;
