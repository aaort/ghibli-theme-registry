import fs from 'fs/promises'
import {
    GhibliRegistry,
    getComponent,
    getComponents,
    getTheme,
    searchComponents
} from 'ghibli-theme-registry'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Example 1: Install a single component with dependencies
 */
async function installSingleComponent() {
  console.log('📦 Installing Button component...\n')

  const buttonData = await getComponent('button')

  if (!buttonData) {
    console.error('❌ Button component not found')
    return
  }

  // Create directories and write files
  for (const file of buttonData.files) {
    const outputDir = file.type === 'registry:lib'
      ? './src/lib'
      : './src/components/ui'

    const filePath = path.join(__dirname, outputDir, file.path)

    // Create directory if it doesn't exist
    await fs.mkdir(path.dirname(filePath), { recursive: true })

    // Write the file
    await fs.writeFile(filePath, file.content, 'utf-8')
    console.log(`✅ Created ${path.relative(__dirname, filePath)}`)
  }

  // Show dependencies to install
  if (buttonData.dependencies.length > 0) {
    console.log('\n📦 Install these dependencies:')
    console.log(`npm install ${buttonData.dependencies.join(' ')}`)
  }
}

/**
 * Example 2: Install multiple components at once
 */
async function installMultipleComponents() {
  console.log('\n📦 Installing multiple components...\n')

  const componentsToInstall = ['mode-toggle', 'dropdown-menu', 'input']
  const results = await getComponents(componentsToInstall)

  const allDependencies = new Set()
  let fileCount = 0

  for (const componentData of results) {
    console.log(`\n📦 Installing ${componentData.component.name}...`)

    for (const file of componentData.files) {
      const outputDir = file.type === 'registry:lib'
        ? './src/lib'
        : file.type === 'registry:style'
        ? './src'
        : './src/components/ui'

      const filePath = path.join(__dirname, outputDir, file.path)

      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, file.content, 'utf-8')
      console.log(`  ✅ ${path.relative(__dirname, filePath)}`)
      fileCount++
    }

    // Collect all dependencies
    componentData.dependencies.forEach(dep => allDependencies.add(dep))
  }

  console.log(`\n✨ Installed ${fileCount} files from ${results.length} components`)

  if (allDependencies.size > 0) {
    console.log('\n📦 Install all dependencies with:')
    console.log(`npm install ${Array.from(allDependencies).join(' ')}`)
  }
}

/**
 * Example 3: Search and install components
 */
async function searchAndInstall() {
  console.log('\n🔍 Searching for menu components...\n')

  const searchResults = await searchComponents('menu')

  if (searchResults.length === 0) {
    console.log('No components found')
    return
  }

  console.log('Found components:')
  searchResults.forEach(component => {
    console.log(`  - ${component.name}: ${component.description || 'No description'}`)
  })

  // Install the first result
  if (searchResults.length > 0) {
    console.log(`\n📦 Installing ${searchResults[0].name}...`)
    const componentData = await getComponent(searchResults[0].name)

    if (componentData) {
      console.log(`Dependencies: ${componentData.dependencies.join(', ') || 'None'}`)
      console.log(`Files: ${componentData.files.length}`)
    }
  }
}

/**
 * Example 4: Install theme styles
 */
async function installTheme() {
  console.log('\n🎨 Installing Ghibli theme...\n')

  // Get theme configuration
  const theme = await getTheme()

  if (!theme) {
    console.error('❌ Theme not found')
    return
  }

  // Create CSS with theme variables
  const cssContent = `/* Ghibli Theme Variables */
:root {
${Object.entries(theme.cssVars.light)
  .map(([key, value]) => `  --${key}: ${value};`)
  .join('\n')}
}

.dark {
${Object.entries(theme.cssVars.dark)
  .map(([key, value]) => `  --${key}: ${value};`)
  .join('\n')}
}
`

  const cssPath = path.join(__dirname, './src/ghibli-theme.css')
  await fs.mkdir(path.dirname(cssPath), { recursive: true })
  await fs.writeFile(cssPath, cssContent, 'utf-8')
  console.log(`✅ Created ${path.relative(__dirname, cssPath)}`)

  // Also install the full theme styles
  const themeComponent = await getComponent('ghibli-theme-styles')
  if (themeComponent) {
    for (const file of themeComponent.files) {
      const filePath = path.join(__dirname, './src', file.path)
      await fs.writeFile(filePath, file.content, 'utf-8')
      console.log(`✅ Created ${path.relative(__dirname, filePath)}`)
    }
  }

  console.log('\n💡 Import the theme in your main CSS file:')
  console.log("   @import './ghibli-theme.css';")
}

/**
 * Example 5: Custom registry configuration
 */
async function useCustomRegistry() {
  console.log('\n🔧 Using custom registry...\n')

  // Create a registry client with custom configuration
  const customRegistry = new GhibliRegistry({
    baseUrl: 'http://localhost:8081', // Use local registry
    style: 'default'
  })

  // List all available components
  const components = await customRegistry.getComponents()
  console.log(`Found ${components.length} components in custom registry`)

  // Get a specific component
  const button = await customRegistry.getRegistryEntry('button')
  if (button) {
    console.log(`\n📦 Button component from custom registry:`)
    console.log(`  Name: ${button.name}`)
    console.log(`  Type: ${button.type}`)
    console.log(`  Dependencies: ${button.dependencies?.join(', ') || 'None'}`)
  }
}

/**
 * Example 6: Analyze component dependencies
 */
async function analyzeDependencies() {
  console.log('\n📊 Analyzing component dependencies...\n')

  const registry = new GhibliRegistry()
  const componentName = 'mode-toggle'

  const resolved = await registry.resolveDependencies(componentName)

  if (!resolved) {
    console.error(`❌ Component ${componentName} not found`)
    return
  }

  console.log(`Component: ${resolved.entry.name}`)
  console.log(`Direct dependencies: ${resolved.entry.registryDependencies?.join(', ') || 'None'}`)

  if (resolved.registryDependencies.length > 0) {
    console.log('\nResolved dependency tree:')
    resolved.registryDependencies.forEach(dep => {
      console.log(`  └─ ${dep.name}`)
      if (dep.registryDependencies && dep.registryDependencies.length > 0) {
        dep.registryDependencies.forEach(subDep => {
          console.log(`     └─ ${subDep}`)
        })
      }
    })
  }

  // Calculate total npm dependencies
  const allNpmDeps = new Set()
  const addDeps = (entry) => {
    entry.dependencies?.forEach(dep => allNpmDeps.add(dep))
    entry.devDependencies?.forEach(dep => allNpmDeps.add(dep))
  }

  addDeps(resolved.entry)
  resolved.registryDependencies.forEach(addDeps)

  console.log(`\nTotal npm dependencies needed: ${allNpmDeps.size}`)
  if (allNpmDeps.size > 0) {
    console.log(Array.from(allNpmDeps).join(', '))
  }
}

/**
 * Main function - run all examples
 */
async function main() {
  console.log('🎨 Ghibli Theme Registry Examples\n')
  console.log('=' .repeat(50))

  try {
    // Run examples based on command line argument
    const example = process.argv[2]

    switch (example) {
      case 'single':
        await installSingleComponent()
        break
      case 'multiple':
        await installMultipleComponents()
        break
      case 'search':
        await searchAndInstall()
        break
      case 'theme':
        await installTheme()
        break
      case 'custom':
        await useCustomRegistry()
        break
      case 'analyze':
        await analyzeDependencies()
        break
      default:
        console.log('Available examples:')
        console.log('  node install-components.js single    - Install a single component')
        console.log('  node install-components.js multiple  - Install multiple components')
        console.log('  node install-components.js search    - Search and install')
        console.log('  node install-components.js theme     - Install theme styles')
        console.log('  node install-components.js custom    - Use custom registry')
        console.log('  node install-components.js analyze   - Analyze dependencies')
        console.log('\nRunning all examples...\n')

        await installSingleComponent()
        await installMultipleComponents()
        await searchAndInstall()
        await installTheme()
        await analyzeDependencies()
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

// Run the examples
main()
