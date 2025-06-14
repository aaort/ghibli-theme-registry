import { RegistryEntry } from "./scripts/schema";

const registry: RegistryEntry[] = [
  {
    name: "button",
    type: "registry:ui",
    description:
      "A versatile button component with multiple variants and sizes.",

    // npm dependencies that this component depends on
    dependencies: [
      "@radix-ui/react-slot",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
    ],
    devDependencies: [],
    registryDependencies: ["utils"],

    // Tailwind CSS config
    tailwind: {
      config: {},
    },

    // CSS variables
    cssVars: {},

    // Files that make up this component in your src/components/ui folder
    files: ["button.tsx"],
  },
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
  {
    name: "ghibli-theme-styles",
    type: "registry:style",

    // shadcn-ui components that this component depends on
    registryDependencies: [],

    // npm dependencies that this component depends on
    dependencies: [],
    devDependencies: [],

    // Tailwind CSS config
    tailwind: {
      config: {},
    },

    // CSS variables
    cssVars: {
      light: {
        background: "44 56% 94%",
        foreground: "30 7% 23%",
        card: "44 56% 94%",
        "card-foreground": "30 7% 23%",
        popover: "44 56% 94%",
        "popover-foreground": "30 7% 23%",
        primary: "2 92% 32%",
        "primary-foreground": "44 56% 94%",
        secondary: "64 78% 25%",
        "secondary-foreground": "44 56% 94%",
        muted: "38 18% 57%",
        "muted-foreground": "30 7% 23%",
        accent: "38 69% 41%",
        "accent-foreground": "44 56% 94%",
        destructive: "0 73% 46%",
        "destructive-foreground": "44 56% 94%",
        border: "39 35% 78%",
        input: "39 35% 78%",
        ring: "38 69% 41%",
        radius: "0.5rem",
      },
      dark: {
        background: "30 7% 16%",
        foreground: "44 56% 86%",
        card: "30 7% 16%",
        "card-foreground": "44 56% 86%",
        popover: "30 7% 16%",
        "popover-foreground": "44 56% 86%",
        primary: "2 96% 60%",
        "primary-foreground": "30 7% 16%",
        secondary: "82 60% 42%",
        "secondary-foreground": "30 7% 16%",
        muted: "38 11% 54%",
        "muted-foreground": "44 56% 86%",
        accent: "45 96% 57%",
        "accent-foreground": "30 7% 16%",
        destructive: "0 73% 46%",
        "destructive-foreground": "44 56% 86%",
        border: "24 9% 23%",
        input: "24 9% 23%",
        ring: "44 64% 48%",
      },
    },

    // Files that make up this style registry (CSS files from src folder)
    files: ["index.css"],
  },
  {
    name: "mode-toggle",
    type: "registry:ui",
    description:
      "A toggle component for switching between light and dark themes.",
    dependencies: ["lucide-react"],
    devDependencies: [],
    registryDependencies: ["button", "utils"],
    tailwind: {
      config: {},
    },
    cssVars: {},
    files: ["mode-toggle.tsx"],
  },
  {
    name: "utils",
    type: "registry:lib",
    description:
      "Utility functions for combining class names using clsx and tailwind-merge.",
    dependencies: ["clsx", "tailwind-merge"],
    devDependencies: [],
    tailwind: {
      config: {},
    },
    cssVars: {},
    files: ["utils.ts"],
  },
];
export default registry;
