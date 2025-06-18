# Ghibli Theme Registry

> A custom shadcn/ui registry featuring Ghibli-inspired themes and components.

This registry provides custom shadcn/ui components with beautiful Ghibli-inspired theming using a Gruvbox color palette.

- [x] Ghibli-inspired Gruvbox theme
- [x] Mode toggle component for dark/light theme switching
- [x] Custom button variants
- [x] Automatic registry generation
- [x] Programmatic API for fetching components
- [x] CLI tool for easy installation
- [x] HTTP API for registry access

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

## Registry API

The Ghibli Theme Registry provides multiple ways to access and install components:

### 1. Programmatic API

Install the package and use it in your JavaScript/TypeScript projects:

```bash
npm install ghibli-theme-registry
```

```javascript
import { getComponent, getTheme, listComponents } from "ghibli-theme-registry";

// Get a component with all dependencies
const button = await getComponent("button");

// Get theme configuration
const theme = await getTheme();

// List all available components
const components = await listComponents();
```

### 2. CLI Tool

Use the CLI tool to install components directly:

```bash
# Install globally
npm install -g ghibli-theme-registry

# Or use npx
npx ghibli-theme-registry <command>
```

```bash
# List all components
ghibli-theme list

# Install components
ghibli-theme get button mode-toggle

# Search for components
ghibli-theme search "menu"

# Get theme configuration
ghibli-theme theme
```

### 3. HTTP API

Start the API server to access the registry via HTTP:

```bash
npm run api:start
```

Then access endpoints like:

- `GET /api/components` - List all components
- `GET /api/components/button` - Get specific component
- `GET /api/theme` - Get theme configuration
- `GET /api/search?q=menu` - Search components

See the [API Documentation](./API.md) for complete details on all available methods and endpoints.

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
- `npm run build:api`: Build the TypeScript API for distribution.
- `npm run lint`: Run ESLint.
- `npm run dev:server`: Starts a server to host your registry locally. This is useful for testing the registry locally and installing in another project.
- `npm run api:start`: Start the HTTP API server.
- `npm run api:dev`: Start the HTTP API server in development mode with auto-reload.
- `npm run cli`: Run the CLI tool directly from source.

## Examples

Check out the [examples](./examples) directory for practical usage examples:

```bash
# Install a single component
node examples/install-components.js single

# Install multiple components
node examples/install-components.js multiple

# Install theme styles
node examples/install-components.js theme

# Analyze component dependencies
node examples/install-components.js analyze
```
