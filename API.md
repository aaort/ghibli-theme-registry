# Ghibli Theme Registry API

The Ghibli Theme Registry provides multiple ways to access and integrate components and styles from the Ghibli theme into your projects.

## Table of Contents

- [Installation](#installation)
- [Programmatic API](#programmatic-api)
- [CLI Tool](#cli-tool)
- [HTTP API](#http-api)
- [Registry Structure](#registry-structure)
- [Available Components](#available-components)

## Installation

```bash
npm install ghibli-theme-registry
# or
pnpm add ghibli-theme-registry
# or
yarn add ghibli-theme-registry
```

## Programmatic API

The programmatic API allows you to fetch components and styles directly in your JavaScript/TypeScript code.

### Basic Usage

```typescript
import { GhibliRegistry } from 'ghibli-theme-registry'

// Create a registry client
const registry = new GhibliRegistry()

// Get a component with all dependencies
const button = await registry.getComponent('button')

// Get theme configuration
const theme = await registry.getTheme()
```

### Available Methods

#### Registry Client

```typescript
import { RegistryClient } from 'ghibli-theme-registry'

const client = new RegistryClient({
  baseUrl: 'https://your-custom-registry.com', // optional
  style: 'default' // or 'new-york'
})

// Get a single component
const button = await client.getRegistryEntry('button')

// Get multiple components
const components = await client.getRegistryEntries(['button', 'input', 'select'])

// Get all UI components
const uiComponents = await client.getComponents()

// Get all styles
const styles = await client.getStyles()

// Get all utilities
const utils = await client.getUtils()

// Search components
const results = await client.searchComponents('menu')

// Resolve dependencies
const resolved = await client.resolveDependencies('mode-toggle')

// Get component with all dependencies
const fullComponent = await client.getComponentWithDependencies('mode-toggle')

// Get theme configuration
const themeConfig = await client.getThemeConfig()
```

#### Convenience Functions

```typescript
import {
  getComponent,
  getComponents,
  getTheme,
  listComponents,
  searchComponents,
  getUIComponents,
  getStyles,
  getUtilities
} from 'ghibli-theme-registry'

// Get a single component
const button = await getComponent('button')

// Get multiple components
const components = await getComponents(['button', 'input'])

// Get theme configuration
const theme = await getTheme()

// List all components
const allComponents = await listComponents()

// Search for components
const searchResults = await searchComponents('menu')
```

### TypeScript Support

The API provides full TypeScript support with exported types:

```typescript
import type {
  RegistryEntry,
  ComponentFile,
  ComponentWithDependencies,
  ThemeConfig,
  ComponentName,
  StyleName,
  UtilName
} from 'ghibli-theme-registry'

// Type-safe component names
import { COMPONENT_NAMES, isValidComponentName } from 'ghibli-theme-registry'

if (isValidComponentName(userInput)) {
  const component = await getComponent(userInput) // TypeScript knows this is valid
}
```

## CLI Tool

The CLI tool allows you to install components directly from the command line.

### Installation

```bash
npm install -g ghibli-theme-registry
# or use npx
npx ghibli-theme-registry <command>
```

### Commands

#### List Components

```bash
# List all available components
ghibli-theme list
```

#### Install Components

```bash
# Install a single component
ghibli-theme get button

# Install multiple components
ghibli-theme get button input select

# Custom output directory
ghibli-theme get button -o ./src/components

# Dry run to see what would be installed
ghibli-theme get button --dry-run

# Force overwrite existing files
ghibli-theme get button --force
```

#### Get Theme Configuration

```bash
# Display theme CSS variables
ghibli-theme theme
```

#### Search Components

```bash
# Search for components by name or description
ghibli-theme search "menu"
```

### CLI Options

- `--output, -o <dir>` - Output directory for UI components (default: `./src/components/ui`)
- `--style-output <dir>` - Output directory for styles (default: `./src`)
- `--lib-output <dir>` - Output directory for lib files (default: `./src/lib`)
- `--base-url <url>` - Custom registry base URL
- `--dry-run` - Show what would be installed without actually doing it
- `--force` - Overwrite existing files
- `--no-deps` - Don't show npm dependency installation instructions

## HTTP API

The HTTP API provides RESTful endpoints for accessing the registry.

### Starting the Server

```bash
# Development
npm run api:dev

# Production
npm run api:start
```

The server runs on port 3000 by default (configurable via `PORT` environment variable).

### Endpoints

#### Get API Information
```http
GET /api
```

Response:
```json
{
  "success": true,
  "data": {
    "name": "Ghibli Theme Registry API",
    "version": "1.0.0",
    "endpoints": {
      "/api/components": "List all components",
      "/api/components/:name": "Get a specific component",
      ...
    }
  }
}
```

#### List All Components
```http
GET /api/components
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "name": "button",
      "type": "registry:ui",
      "description": "A versatile button component",
      ...
    }
  ]
}
```

#### Get Specific Component
```http
GET /api/components/button
```

#### Get Component with Dependencies
```http
GET /api/resolve/mode-toggle
```

Response includes the component and all resolved dependencies with their files.

#### Get Styles
```http
GET /api/styles
```

#### Get Utilities
```http
GET /api/utils
```

#### Get Theme Configuration
```http
GET /api/theme
```

Response:
```json
{
  "success": true,
  "data": {
    "cssVars": {
      "light": {
        "background": "44 56% 94%",
        "foreground": "30 7% 23%",
        ...
      },
      "dark": {
        "background": "30 7% 16%",
        "foreground": "44 56% 86%",
        ...
      }
    },
    "tailwindConfig": {}
  }
}
```

#### Search Components
```http
GET /api/search?q=menu
```

#### Get Component Dependencies
```http
GET /api/dependencies/mode-toggle
```

#### Batch Get Components
```http
GET /api/batch?names=button,input,select
```

### CORS Support

All endpoints support CORS, allowing you to fetch from browser applications:

```javascript
const response = await fetch('http://localhost:3000/api/components')
const data = await response.json()
```

## Registry Structure

Each registry entry follows this structure:

```typescript
interface RegistryEntry {
  name: string
  type: 'registry:ui' | 'registry:style' | 'registry:lib'
  description?: string
  dependencies?: string[]         // npm dependencies
  devDependencies?: string[]     // npm dev dependencies
  registryDependencies?: string[] // other registry components
  files?: Array<{
    path: string
    content: string
    type: string
  }>
  tailwind?: {
    config: {
      content?: string[]
      theme?: Record<string, any>
      plugins?: string[]
    }
  }
  cssVars?: {
    light?: Record<string, string>
    dark?: Record<string, string>
  }
}
```

## Available Components

### UI Components

- `button` - A versatile button component with multiple variants and sizes
- `context-menu` - Context menu with sub-menus, checkboxes, and radio items
- `dropdown-menu` - Dropdown menu with sub-menus, checkboxes, and radio items
- `input` - Basic input field component with consistent styling
- `label` - Label component for form elements
- `select` - Select component with groups, labels, and custom styling
- `separator` - Visual separator component (horizontal or vertical)
- `slider` - Slider component for selecting values from a range
- `switch` - Toggle switch component for binary on/off states
- `tabs` - Tab component for organizing content into multiple panels
- `textarea` - Textarea component for multi-line text input
- `mode-toggle` - Toggle component for switching between light and dark themes

### Styles

- `ghibli-theme-styles` - Core theme styles with CSS variables for light and dark modes

### Utilities

- `utils` - Utility functions for combining class names using clsx and tailwind-merge

## Examples

### Installing Components in a React Project

```javascript
// install-components.js
import { getComponents } from 'ghibli-theme-registry'
import fs from 'fs/promises'
import path from 'path'

async function installComponents() {
  // Get multiple components with dependencies
  const components = await getComponents(['button', 'mode-toggle'])

  for (const { files, dependencies } of components) {
    // Write component files
    for (const file of files) {
      const filePath = path.join('./src/components/ui', file.path)
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, file.content)
    }

    console.log('Dependencies to install:', dependencies)
  }
}

installComponents()
```

### Using the Theme in Your App

```typescript
import { getTheme } from 'ghibli-theme-registry'

async function setupTheme() {
  const theme = await getTheme()

  if (theme) {
    // Apply CSS variables to your app
    const root = document.documentElement

    // Apply light theme by default
    Object.entries(theme.cssVars.light).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })

    // Switch to dark theme when needed
    function setDarkMode(isDark: boolean) {
      const vars = isDark ? theme.cssVars.dark : theme.cssVars.light
      Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value)
      })
    }
  }
}
```

### Custom Registry Server

You can host your own registry by serving the JSON files:

```javascript
import express from 'express'
import { RegistryClient } from 'ghibli-theme-registry'

const app = express()
const registry = new RegistryClient({
  baseUrl: 'https://your-registry.com/registry'
})

app.get('/api/components/:name', async (req, res) => {
  const component = await registry.getRegistryEntry(req.params.name)
  res.json(component)
})

app.listen(3000)
```

## License

MIT
