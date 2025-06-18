# Ghibli Theme Registry Index

Last updated: 6/18/2025

## Components (13)

| Name | Description | Dependencies |
|------|-------------|--------------|
| `button` | A versatile button component with multiple variants and sizes. | @radix-ui/react-slot, class-variance-authority, clsx, tailwind-merge, utils |
| `context-menu` | A context menu component with support for sub-menus, checkboxes, and radio items. | @radix-ui/react-context-menu, lucide-react, utils |
| `dropdown-menu` | A dropdown menu component with support for sub-menus, checkboxes, and radio items. | @radix-ui/react-dropdown-menu, lucide-react, utils |
| `ghibli-theme` | - | button |
| `input` | A basic input field component with consistent styling. | utils |
| `label` | A label component for form elements. | @radix-ui/react-label, class-variance-authority, utils |
| `mode-toggle` | A toggle component for switching between light and dark themes. | lucide-react, button, utils |
| `select` | A select component with support for groups, labels, and custom styling. | @radix-ui/react-select, lucide-react, utils |
| `separator` | A visual separator component that can be horizontal or vertical. | @radix-ui/react-separator, utils |
| `slider` | A slider component for selecting values from a range. | @radix-ui/react-slider, utils |
| `switch` | A toggle switch component for binary on/off states. | @radix-ui/react-switch, utils |
| `tabs` | A tab component for organizing content into multiple panels. | @radix-ui/react-tabs, utils |
| `textarea` | A textarea component for multi-line text input. | utils |

## Styles (1)

| Name | Description |
|------|-------------|
| `ghibli-theme-styles` | - |

## Utilities (1)

| Name | Description |
|------|-------------|
| `utils` | Utility functions for combining class names using clsx and tailwind-merge. |

## Installation

### Using shadcn CLI

```bash
npx shadcn@latest add https://raw.githubusercontent.com/aaort/ghibli-theme-registry/main/registry/<component-name>.json
```

### Using Ghibli Theme CLI

```bash
npx ghibli-theme-registry get <component-name>
```

### Programmatic API

```javascript
import { getComponent } from 'ghibli-theme-registry'

const component = await getComponent('<component-name>')
```
