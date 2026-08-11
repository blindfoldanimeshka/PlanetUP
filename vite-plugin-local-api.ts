import type { Plugin } from 'vite'

/**
 * Local dev middleware that adapts the Vercel serverless function
 * so `/api/submit-form` works under `npm run dev` without `vercel dev`.
 *
 * Uses Vite's ssrLoadModule to import the .ts handler (handles transpilation),
 * then adapts Node's req/res to the VercelRequest/VercelResponse shape.
 */
export function localApiPlugin(): Plugin {
  return {
    name: 'local-api',
    apply: 'serve',
    configureServer(server) {
      return () => {
        server.middlewares.use('/api/submit-form', async (req, res) => {
          try {
            // Collect raw body
            const chunks: Buffer[] = []
            for await (const chunk of req) {
              chunks.push(chunk as Buffer)
            }
            const rawBody = Buffer.concat(chunks).toString('utf-8')

            // Load the Vercel handler via Vite SSR (handles .ts transpilation)
            const { default: handler } = await server.ssrLoadModule('/api/submit-form')

            // Build VercelRequest-compatible object
            const nodeReq = req as any
            nodeReq.body = rawBody ? JSON.parse(rawBody) : {}
            nodeReq.query = Object.fromEntries(
              new URL(req.url ?? '', 'http://localhost').searchParams
            )

            // Build VercelResponse-compatible object
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
            console.error('[local-api] submit-form error:', err)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Internal server error' }))
          }
        })
      }
    },
  }
}
