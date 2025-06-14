# Ghibli Theme Registry

> A custom shadcn/ui registry featuring Ghibli-inspired themes and components.

This registry provides custom shadcn/ui components with beautiful Ghibli-inspired theming using a Gruvbox color palette.

- [x] Ghibli-inspired Gruvbox theme
- [x] Mode toggle component for dark/light theme switching
- [x] Custom button variants
- [x] Automatic registry generation

## Available Components

### Mode Toggle

A beautiful theme toggle component that switches between light and dark modes with smooth transitions.

```bash
npx shadcn@latest add https://raw.githubusercontent.com/aaort/ghibli-theme-registry/main/registry/mode-toggle.json
```

### Button

Enhanced button component with Ghibli theme styling.

```bash
npx shadcn@latest add https://raw.githubusercontent.com/aaort/ghibli-theme-registry/main/registry/button.json
```

### Ghibli Theme Styles

Complete Ghibli-inspired Gruvbox theme with light and dark variants.

```bash
npx shadcn@latest add https://raw.githubusercontent.com/aaort/ghibli-theme-registry/main/registry/ghibli-theme-styles.json
```

## Usage

1. Use the template by clicking the green "Use this template" button on the top right of the page.
2. Clone the repository to your local machine.
3. Edit `package.json` to include your own information. Most importantly, change the `repository` field to your own GitHub repository URL.
4. Run `npm run dev` to develop components locally. You can add your components to the `src/components/ui` directory.
5. Edit `registry.ts`. See [Registry Configuration](#registry-configuration) for more information.
6. Run `npm run build` to build the registry and push your changes to GitHub to deploy the registry.

## Registry Configuration

The registry is configured in `registry.ts`. The registry is an array of "registries", each object representing a component. Don't worry, the registry has TypeScript support, so you'll get autocompletion and type checking to make sure your registry is valid.

The syntax of this file uses the same syntax as `shadcn` requires for the final registries. Each object in the array can have the following fields:

- `name`: The name of the component.
- `description` (optional): A description of the component.
- `type`: The type of the component. This can be `registry:ui` (general ui components, in `/src/components/ui`) or `registry:component` (specific components, in `/src/components`).
- `registryDependencies` (optional): An array of shadcn component dependencies for the component. This is an array of strings, each string being the shadcn name of a component that this component depends on.
- `dependencies` and `devDependencies` (optional): An array of npm dependencies for the component. This is an array of strings, each string being the name of an npm package that this component depends on.
- `tailwind` (optional): Tailwind Config that needs to be added when installing
- `cssVars` (optional): CSS Variables that needs to be added when installing
- `files`: An array of file names that should be included when installing the component. This is an array of strings of file names, relative to the component's directory (`/src/components` or `/src/components/ui`, depending on what `type` you added).
  Alternatively, you can provide raw file contents by using an object that conforms to the shadcn registry format.

## Commands

- `npm run dev`: Start the development server. This will simply start a vite server so you can develop your components locally.
- `npm run build`: Build the registry. This will build the registry and output it to the `build` directory. This will also output information on where the registry is located and how users can install it - you should probably copy this information to your README.
- `npm run build:demo`: Build the demo.
- `npm run lint`
- `npm run dev:server`: Starts a server to host your registry locally. This is useful for testing the registry locally and installing in another project.
