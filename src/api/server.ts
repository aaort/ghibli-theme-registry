import { createServer, IncomingMessage, ServerResponse } from 'http'
import { parse } from 'url'
import { RegistryEntry } from '../../scripts/schema'
import { RegistryClient } from './registry-client'

const PORT = process.env.PORT || 3000
const registry = new RegistryClient()

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

function sendJson(res: ServerResponse, status: number, data: ApiResponse) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  res.end(JSON.stringify(data, null, 2))
}

function sendError(res: ServerResponse, status: number, message: string) {
  sendJson(res, status, { success: false, error: message })
}

function sendSuccess<T>(res: ServerResponse, data: T) {
  sendJson(res, 200, { success: true, data })
}

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const parsedUrl = parse(req.url || '', true)
  const pathname = parsedUrl.pathname || '/'
  const query = parsedUrl.query

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    res.end()
    return
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    sendError(res, 405, 'Method not allowed')
    return
  }

  try {
    // Route: GET /api/components
    if (pathname === '/api/components') {
      const components = await registry.getComponents()
      sendSuccess(res, components)
      return
    }

    // Route: GET /api/components/:name
    const componentMatch = pathname.match(/^\/api\/components\/([^\/]+)$/)
    if (componentMatch) {
      const name = componentMatch[1]
      const component = await registry.getRegistryEntry(name)

      if (!component) {
        sendError(res, 404, `Component "${name}" not found`)
        return
      }

      sendSuccess(res, component)
      return
    }

    // Route: GET /api/resolve/:name
    const resolveMatch = pathname.match(/^\/api\/resolve\/([^\/]+)$/)
    if (resolveMatch) {
      const name = resolveMatch[1]
      const resolved = await registry.getComponentWithDependencies(name)

      if (!resolved) {
        sendError(res, 404, `Component "${name}" not found`)
        return
      }

      sendSuccess(res, resolved)
      return
    }

    // Route: GET /api/styles
    if (pathname === '/api/styles') {
      const styles = await registry.getStyles()
      sendSuccess(res, styles)
      return
    }

    // Route: GET /api/utils
    if (pathname === '/api/utils') {
      const utils = await registry.getUtils()
      sendSuccess(res, utils)
      return
    }

    // Route: GET /api/theme
    if (pathname === '/api/theme') {
      const theme = await registry.getThemeConfig()

      if (!theme) {
        sendError(res, 404, 'Theme configuration not found')
        return
      }

      sendSuccess(res, theme)
      return
    }

    // Route: GET /api/search?q=query
    if (pathname === '/api/search') {
      const searchQuery = query.q as string

      if (!searchQuery) {
        sendError(res, 400, 'Missing search query parameter "q"')
        return
      }

      const results = await registry.searchComponents(searchQuery)
      sendSuccess(res, results)
      return
    }

    // Route: GET /api/dependencies/:name
    const depsMatch = pathname.match(/^\/api\/dependencies\/([^\/]+)$/)
    if (depsMatch) {
      const name = depsMatch[1]
      const resolved = await registry.resolveDependencies(name)

      if (!resolved) {
        sendError(res, 404, `Component "${name}" not found`)
        return
      }

      sendSuccess(res, {
        component: resolved.entry,
        registryDependencies: resolved.registryDependencies,
        dependencies: resolved.entry.dependencies || [],
        devDependencies: resolved.entry.devDependencies || []
      })
      return
    }

    // Route: GET /api/batch
    if (pathname === '/api/batch' && query.names) {
      const names = (query.names as string).split(',').map(n => n.trim())
      const entries = await registry.getRegistryEntries(names)

      const result: Record<string, RegistryEntry | null> = {}
      for (const name of names) {
        result[name] = entries.find(e => e.name === name) || null
      }

      sendSuccess(res, result)
      return
    }

    // Route: GET /api
    if (pathname === '/api' || pathname === '/api/') {
      sendSuccess(res, {
        name: 'Ghibli Theme Registry API',
        version: '1.0.0',
        endpoints: {
          '/api/components': 'List all components',
          '/api/components/:name': 'Get a specific component',
          '/api/resolve/:name': 'Get component with all dependencies resolved',
          '/api/styles': 'List all styles',
          '/api/utils': 'List all utilities',
          '/api/theme': 'Get theme configuration',
          '/api/search?q=query': 'Search components',
          '/api/dependencies/:name': 'Get component dependencies',
          '/api/batch?names=name1,name2': 'Get multiple components at once'
        }
      })
      return
    }

    // Route: GET /health
    if (pathname === '/health') {
      sendSuccess(res, { status: 'healthy', timestamp: new Date().toISOString() })
      return
    }

    // 404 for unknown routes
    sendError(res, 404, 'Endpoint not found')
  } catch (error) {
    console.error('Server error:', error)
    sendError(res, 500, 'Internal server error')
  }
}

// Create and start the server
const server = createServer(handleRequest)

server.listen(PORT, () => {
  console.log(`🚀 Ghibli Theme Registry API Server`)
  console.log(`📡 Listening on http://localhost:${PORT}`)
  console.log(`\nAvailable endpoints:`)
  console.log(`  GET /api                       - API information`)
  console.log(`  GET /api/components            - List all components`)
  console.log(`  GET /api/components/:name      - Get a specific component`)
  console.log(`  GET /api/resolve/:name         - Get component with dependencies`)
  console.log(`  GET /api/styles                - List all styles`)
  console.log(`  GET /api/utils                 - List all utilities`)
  console.log(`  GET /api/theme                 - Get theme configuration`)
  console.log(`  GET /api/search?q=query        - Search components`)
  console.log(`  GET /api/dependencies/:name    - Get component dependencies`)
  console.log(`  GET /api/batch?names=n1,n2     - Get multiple components`)
  console.log(`  GET /health                    - Health check`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, shutting down gracefully...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
