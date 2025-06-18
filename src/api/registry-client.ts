import { registryEntrySchema, type RegistryEntry } from '../../scripts/schema'

export interface RegistryClientConfig {
  baseUrl?: string
  style?: 'default' | 'new-york'
}

export class RegistryClient {
  private baseUrl: string
  private style: string

  constructor(config: RegistryClientConfig = {}) {
    this.baseUrl = config.baseUrl || 'https://raw.githubusercontent.com/aaort/ghibli-theme-registry/main/registry'
    this.style = config.style || 'default'
  }

  /**
   * Fetch a single registry entry by name
   */
  async getRegistryEntry(name: string): Promise<RegistryEntry | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${name}.json`)
      if (!response.ok) {
        console.error(`Failed to fetch registry entry: ${name}`)
        return null
      }

      const data = await response.json()
      const validated = registryEntrySchema.parse(data)
      return validated
    } catch (error) {
      console.error(`Error fetching registry entry ${name}:`, error)
      return null
    }
  }

  /**
   * Fetch multiple registry entries
   */
  async getRegistryEntries(names: string[]): Promise<RegistryEntry[]> {
    const entries = await Promise.all(
      names.map(name => this.getRegistryEntry(name))
    )
    return entries.filter((entry): entry is RegistryEntry => entry !== null)
  }

  /**
   * Get all components (UI registry items)
   */
  async getComponents(): Promise<RegistryEntry[]> {
    // In a real implementation, you'd have an index endpoint
    // For now, we'll use the known component list
    const componentNames = [
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
    ]

    const entries = await this.getRegistryEntries(componentNames)
    return entries.filter(entry => entry.type === 'registry:ui')
  }

  /**
   * Get all styles
   */
  async getStyles(): Promise<RegistryEntry[]> {
    const styleNames = ['ghibli-theme-styles']
    const entries = await this.getRegistryEntries(styleNames)
    return entries.filter(entry => entry.type === 'registry:style')
  }

  /**
   * Get all library utilities
   */
  async getUtils(): Promise<RegistryEntry[]> {
    const utilNames = ['utils']
    const entries = await this.getRegistryEntries(utilNames)
    return entries.filter(entry => entry.type === 'registry:lib')
  }

  /**
   * Resolve all dependencies for a component
   */
  async resolveDependencies(name: string): Promise<{
    entry: RegistryEntry
    dependencies: RegistryEntry[]
    registryDependencies: RegistryEntry[]
  } | null> {
    const entry = await this.getRegistryEntry(name)
    if (!entry) return null

    const registryDeps = entry.registryDependencies || []
    const resolvedDeps: RegistryEntry[] = []
    const visited = new Set<string>()

    const resolveDep = async (depName: string) => {
      if (visited.has(depName)) return
      visited.add(depName)

      const dep = await this.getRegistryEntry(depName)
      if (!dep) return

      resolvedDeps.push(dep)

      // Recursively resolve nested dependencies
      const nestedDeps = dep.registryDependencies || []
      for (const nestedDep of nestedDeps) {
        await resolveDep(nestedDep)
      }
    }

    for (const dep of registryDeps) {
      await resolveDep(dep)
    }

    return {
      entry,
      dependencies: [],
      registryDependencies: resolvedDeps
    }
  }

  /**
   * Get component with all its files and dependencies resolved
   */
  async getComponentWithDependencies(name: string): Promise<{
    component: RegistryEntry
    files: Array<{
      path: string
      content: string
      type: string
    }>
    dependencies: string[]
    devDependencies: string[]
  } | null> {
    const resolved = await this.resolveDependencies(name)
    if (!resolved) return null

    const allFiles: Array<{
      path: string
      content: string
      type: string
    }> = []

    const allDependencies = new Set<string>()
    const allDevDependencies = new Set<string>()

    // Collect files and dependencies from main component
    const processEntry = (entry: RegistryEntry) => {
      // Add files
      if (entry.files) {
        for (const file of entry.files) {
          if (typeof file === 'object') {
            allFiles.push({
              path: file.path,
              content: file.content || '',
              type: file.type
            })
          }
        }
      }

      // Add dependencies
      if (entry.dependencies) {
        entry.dependencies.forEach(dep => allDependencies.add(dep))
      }
      if (entry.devDependencies) {
        entry.devDependencies.forEach(dep => allDevDependencies.add(dep))
      }
    }

    // Process main component
    processEntry(resolved.entry)

    // Process registry dependencies
    for (const dep of resolved.registryDependencies) {
      processEntry(dep)
    }

    return {
      component: resolved.entry,
      files: allFiles,
      dependencies: Array.from(allDependencies),
      devDependencies: Array.from(allDevDependencies)
    }
  }

  /**
   * Get the theme configuration including CSS variables
   */
  async getThemeConfig(): Promise<{
    cssVars: {
      light: Record<string, string>
      dark: Record<string, string>
    }
    tailwindConfig: any
  } | null> {
    const styles = await this.getStyles()
    const themeStyle = styles.find(s => s.name === 'ghibli-theme-styles')

    if (!themeStyle) return null

    return {
      cssVars: themeStyle.cssVars || { light: {}, dark: {} },
      tailwindConfig: themeStyle.tailwind?.config || {}
    }
  }

  /**
   * Search components by name or description
   */
  async searchComponents(query: string): Promise<RegistryEntry[]> {
    const components = await this.getComponents()
    const lowercaseQuery = query.toLowerCase()

    return components.filter(component =>
      component.name.toLowerCase().includes(lowercaseQuery) ||
      (component.description && component.description.toLowerCase().includes(lowercaseQuery))
    )
  }

  /**
   * Get component preview/demo code if available
   */
  async getComponentDemo(name: string): Promise<string | null> {
    const entry = await this.getRegistryEntry(name)
    if (!entry || !entry.source) return null

    try {
      const response = await fetch(entry.source)
      if (!response.ok) return null
      return await response.text()
    } catch {
      return null
    }
  }
}

// Export a default instance for convenience
export const defaultRegistry = new RegistryClient()

// Export helper functions for common operations
export async function getComponent(name: string, config?: RegistryClientConfig) {
  const client = new RegistryClient(config)
  return client.getComponentWithDependencies(name)
}

export async function getTheme(config?: RegistryClientConfig) {
  const client = new RegistryClient(config)
  return client.getThemeConfig()
}

export async function listComponents(config?: RegistryClientConfig) {
  const client = new RegistryClient(config)
  return client.getComponents()
}
