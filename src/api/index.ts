/**
 * Ghibli Theme Registry API
 *
 * This module provides a programmatic API for accessing components and styles
 * from the Ghibli theme registry.
 *
 * @example
 * ```typescript
 * import { GhibliRegistry } from 'ghibli-theme-registry'
 *
 * // Create a registry client
 * const registry = new GhibliRegistry()
 *
 * // Get a component with all dependencies
 * const button = await registry.getComponent('button')
 *
 * // Get theme configuration
 * const theme = await registry.getTheme()
 * ```
 */

export { RegistryClient as GhibliRegistry, RegistryClient } from './registry-client'
export type { RegistryClientConfig } from './registry-client'

// Re-export schema types
export type {
    Block,
    BlockChunk, Registry, RegistryEntry
} from '../../scripts/schema'

// Import everything from registry-client for re-export
import {
    defaultRegistry,
    getComponent,
    getTheme,
    listComponents,
    RegistryClient
} from './registry-client'

/**
 * Default registry instance configured with the main Ghibli theme registry
 */
export { defaultRegistry }

/**
 * Get a component with all its dependencies resolved
 *
 * @param name - The name of the component to fetch
 * @param config - Optional configuration for the registry client
 * @returns Component data with files and dependencies, or null if not found
 *
 * @example
 * ```typescript
 * const buttonData = await getComponent('button')
 * if (buttonData) {
 *   console.log(buttonData.files)
 *   console.log(buttonData.dependencies)
 * }
 * ```
 */
export { getComponent }

/**
 * Get the theme configuration including CSS variables and Tailwind config
 *
 * @param config - Optional configuration for the registry client
 * @returns Theme configuration or null if not found
 *
 * @example
 * ```typescript
 * const theme = await getTheme()
 * if (theme) {
 *   console.log(theme.cssVars.light)
 *   console.log(theme.cssVars.dark)
 * }
 * ```
 */
export { getTheme }

/**
 * List all available components in the registry
 *
 * @param config - Optional configuration for the registry client
 * @returns Array of registry entries for all components
 *
 * @example
 * ```typescript
 * const components = await listComponents()
 * components.forEach(component => {
 *   console.log(component.name, component.description)
 * })
 * ```
 */
export { listComponents }

/**
 * Convenience functions for specific component types
 */

/**
 * Get all available UI components
 */
export async function getUIComponents(config?: RegistryClientConfig) {
  const client = new RegistryClient(config)
  return client.getComponents()
}

/**
 * Get all available styles
 */
export async function getStyles(config?: RegistryClientConfig) {
  const client = new RegistryClient(config)
  return client.getStyles()
}

/**
 * Get all available utilities
 */
export async function getUtilities(config?: RegistryClientConfig) {
  const client = new RegistryClient(config)
  return client.getUtils()
}

/**
 * Search for components by name or description
 */
export async function searchComponents(query: string, config?: RegistryClientConfig) {
  const client = new RegistryClient(config)
  return client.searchComponents(query)
}

/**
 * Get a component's demo/preview code
 */
export async function getComponentDemo(name: string, config?: RegistryClientConfig) {
  const client = new RegistryClient(config)
  return client.getComponentDemo(name)
}

/**
 * Batch operations
 */

/**
 * Get multiple components at once with all their dependencies
 */
export async function getComponents(names: string[], config?: RegistryClientConfig) {
  const client = new RegistryClient(config)
  const results = await Promise.all(
    names.map(name => client.getComponentWithDependencies(name))
  )
  return results.filter((result): result is NonNullable<typeof result> => result !== null)
}

/**
 * Get all components with a specific dependency
 */
export async function getComponentsWithDependency(
  dependency: string,
  config?: RegistryClientConfig
) {
  const client = new RegistryClient(config)
  const components = await client.getComponents()

  return components.filter(component =>
    component.registryDependencies?.includes(dependency) ||
    component.dependencies?.includes(dependency)
  )
}

/**
 * Utility types for better TypeScript support
 */

export interface ComponentFile {
  path: string
  content: string
  type: string
}

export interface ComponentWithDependencies {
  component: RegistryEntry
  files: ComponentFile[]
  dependencies: string[]
  devDependencies: string[]
}

export interface ThemeConfig {
  cssVars: {
    light: Record<string, string>
    dark: Record<string, string>
  }
  tailwindConfig: any
}

/**
 * Registry metadata
 */

export const REGISTRY_URL = 'https://raw.githubusercontent.com/aaort/ghibli-theme-registry/main/registry'
export const REPOSITORY_URL = 'https://github.com/aaort/ghibli-theme-registry'

/**
 * Available component names
 */
export const COMPONENT_NAMES = [
  'button',
  'context-menu',
  'dropdown-menu',
  'input',
  'label',
  'select',
  'separator',
  'slider',
  'switch',
  'tabs',
  'textarea',
  'mode-toggle'
] as const

export type ComponentName = typeof COMPONENT_NAMES[number]

/**
 * Available style names
 */
export const STYLE_NAMES = ['ghibli-theme-styles'] as const
export type StyleName = typeof STYLE_NAMES[number]

/**
 * Available utility names
 */
export const UTIL_NAMES = ['utils'] as const
export type UtilName = typeof UTIL_NAMES[number]

/**
 * Helper to check if a string is a valid component name
 */
export function isValidComponentName(name: string): name is ComponentName {
  return COMPONENT_NAMES.includes(name as ComponentName)
}

/**
 * Helper to check if a string is a valid style name
 */
export function isValidStyleName(name: string): name is StyleName {
  return STYLE_NAMES.includes(name as StyleName)
}

/**
 * Helper to check if a string is a valid utility name
 */
export function isValidUtilName(name: string): name is UtilName {
  return UTIL_NAMES.includes(name as UtilName)
}
