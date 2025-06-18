import chalk from 'chalk'
import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { RegistryEntry } from './schema'

interface RegistryIndex {
  version: string
  timestamp: string
  baseUrl: string
  components: Array<{
    name: string
    type: string
    description?: string
    dependencies?: string[]
    registryDependencies?: string[]
  }>
  styles: Array<{
    name: string
    type: string
    description?: string
  }>
  utils: Array<{
    name: string
    type: string
    description?: string
  }>
}

async function buildIndex() {
  console.log(chalk.bold('Building registry index...'))

  const registryDir = './registry'
  const files = await readdir(registryDir)

  const components: RegistryIndex['components'] = []
  const styles: RegistryIndex['styles'] = []
  const utils: RegistryIndex['utils'] = []

  // Read all JSON files in the registry directory
  for (const file of files) {
    if (!file.endsWith('.json') || file === 'index.json') {
      continue
    }

    const filePath = join(registryDir, file)
    const content = await readFile(filePath, 'utf-8')

    try {
      const entry: RegistryEntry = JSON.parse(content)

      const metadata = {
        name: entry.name,
        type: entry.type,
        description: entry.description,
        dependencies: entry.dependencies,
        registryDependencies: entry.registryDependencies
      }

      // Categorize by type
      switch (entry.type) {
        case 'registry:ui':
        case 'registry:component':
          components.push(metadata)
          break
        case 'registry:style':
          styles.push({
            name: entry.name,
            type: entry.type,
            description: entry.description
          })
          break
        case 'registry:lib':
          utils.push({
            name: entry.name,
            type: entry.type,
            description: entry.description
          })
          break
      }
    } catch (error) {
      console.error(chalk.red(`Error parsing ${file}:`), error)
    }
  }

  // Sort entries by name
  components.sort((a, b) => a.name.localeCompare(b.name))
  styles.sort((a, b) => a.name.localeCompare(b.name))
  utils.sort((a, b) => a.name.localeCompare(b.name))

  // Get repository info from package.json
  const packageJson = JSON.parse(await readFile('./package.json', 'utf-8'))
  const repoUrl = packageJson.repository?.url || ''
  const baseUrl = repoUrl
    .replace(/^git\+/, '')
    .replace(/\.git$/, '')
    .replace('github.com', 'raw.githubusercontent.com')
    + '/main/registry'

  // Create index object
  const index: RegistryIndex = {
    version: packageJson.version || '0.0.0',
    timestamp: new Date().toISOString(),
    baseUrl,
    components,
    styles,
    utils
  }

  // Write index file
  const indexPath = join(registryDir, 'index.json')
  await writeFile(indexPath, JSON.stringify(index, null, 2))

  console.log(chalk.green(`✓ Registry index built successfully`))
  console.log(`  ${chalk.bold('Components:')} ${components.length}`)
  console.log(`  ${chalk.bold('Styles:')} ${styles.length}`)
  console.log(`  ${chalk.bold('Utils:')} ${utils.length}`)
  console.log(`  ${chalk.bold('Total:')} ${components.length + styles.length + utils.length}`)
  console.log(`\n${chalk.bold('Index file:')} ${chalk.blue(indexPath)}`)

  // Also create a markdown index for documentation
  const markdownContent = `# Ghibli Theme Registry Index

Last updated: ${new Date().toLocaleDateString()}

## Components (${components.length})

| Name | Description | Dependencies |
|------|-------------|--------------|
${components.map(c => `| \`${c.name}\` | ${c.description || '-'} | ${[...(c.dependencies || []), ...(c.registryDependencies || [])].join(', ') || '-'} |`).join('\n')}

## Styles (${styles.length})

| Name | Description |
|------|-------------|
${styles.map(s => `| \`${s.name}\` | ${s.description || '-'} |`).join('\n')}

## Utilities (${utils.length})

| Name | Description |
|------|-------------|
${utils.map(u => `| \`${u.name}\` | ${u.description || '-'} |`).join('\n')}

## Installation

### Using shadcn CLI

\`\`\`bash
npx shadcn@latest add ${baseUrl}/<component-name>.json
\`\`\`

### Using Ghibli Theme CLI

\`\`\`bash
npx ghibli-theme-registry get <component-name>
\`\`\`

### Programmatic API

\`\`\`javascript
import { getComponent } from 'ghibli-theme-registry'

const component = await getComponent('<component-name>')
\`\`\`
`

  await writeFile('./REGISTRY.md', markdownContent)
  console.log(`${chalk.bold('Documentation:')} ${chalk.blue('./REGISTRY.md')}`)
}

// Run the build
buildIndex().catch(error => {
  console.error(chalk.red('Error building index:'), error)
  process.exit(1)
})
