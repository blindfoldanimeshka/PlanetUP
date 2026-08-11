import type { Plugin } from 'vite'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Load .env.local into process.env (Vite doesn't do this for serverless funcs).
 * Only sets variables that aren't already set, so real env wins.
 */
function loadEnvLocal(server: { config: { root: string } }) {
  const path = resolve(server.config.root, '.env.local')
  if (!existsSync(path)) return
  const text = readFileSync(path, 'utf-8')
  for (const line of text.split('\n')) {
    const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/)
    if (match && !process.env[match[1]]) {
      // Strip surrounding quotes and trailing \r
      let val = match[2].trim().replace(/^["']|["']$/g, '').replace(/\r$/, '')
      process.env[match[1]] = val
    }
  }
}

/**
 * Adapts a Vercel serverless function to work under `npm run dev`.
 * Uses Vite's ssrLoadModule for .ts transpilation, then bridges req/res.
 */
async function handleApiRoute(
  server: { ssrLoadModule: (p: string) => Promise<any> },
  route: string,
  req: any,
  res: any
) {
  try {
    // Collect raw body
    const chunks: Buffer[] = []
    for await (const chunk of req) {
      chunks.push(chunk as Buffer)
    }
    const rawBody = Buffer.concat(chunks).toString('utf-8')

    // Load handler
    const { default: handler } = await server.ssrLoadModule(route)

    // VercelRequest-compatible
    const nodeReq = req as any
    nodeReq.body = rawBody ? JSON.parse(rawBody) : {}
    nodeReq.query = Object.fromEntries(
      new URL(req.url ?? '', 'http://localhost').searchParams
    )

    // VercelResponse-compatible
    const vercelRes: any = {
      status(code: number) {
        res.statusCode = code
        return this
      },
      json(body: unknown) {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(body))
        return this
      },
      send(body: unknown) {
        res.end(typeof body === 'string' ? body : JSON.stringify(body))
        return this
      },
      setHeader(key: string, value: string | number | readonly string[]) {
        res.setHeader(key, value)
        return this
      },
      end(chunk?: any) {
        res.end(chunk)
        return this
      },
    }

    await handler(nodeReq, vercelRes)
  } catch (err) {
    console.error(`[local-api] ${route} error:`, err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Internal server error' }))
  }
}

export function localApiPlugin(): Plugin {
  return {
    name: 'local-api',
    apply: 'serve',
    configureServer(server) {
      loadEnvLocal(server)
      return () => {
        const routes = ['/api/submit-form', '/api/tg/webhook', '/api/content']
        for (const route of routes) {
          server.middlewares.use(route, (req, res) =>
            handleApiRoute(server, route, req, res)
          )
        }
      }
    },
  }
}
