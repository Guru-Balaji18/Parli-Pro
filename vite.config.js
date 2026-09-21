import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// In production Vercel runs api/ask.js as a serverless function. `npm run dev`
// is only Vite, so this mounts the same handler on the dev server — otherwise
// the AI tutor could only ever be tested after a deploy. Keys come from
// .env.local (GEMINI_API_KEY=...), which is gitignored.
function apiDevServer(env) {
  return {
    name: 'parlipro-api-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/ask', async (req, res) => {
        for (const [k, v] of Object.entries(env)) {
          if (process.env[k] === undefined) process.env[k] = v
        }
        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        req.body = chunks.length ? Buffer.concat(chunks).toString('utf8') : ''
        // Give the Node response the little bit of the Vercel response API the
        // handler uses.
        res.status = (code) => {
          res.statusCode = code
          return res
        }
        res.json = (obj) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(obj))
        }
        try {
          const mod = await server.ssrLoadModule('/api/ask.js')
          await mod.default(req, res)
        } catch (e) {
          server.config.logger.error(`[api/ask] ${e.stack || e}`)
          if (!res.writableEnded) res.status(500).json({ error: 'Local API handler crashed. See the dev server log.' })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return { plugins: [react(), apiDevServer(env)] }
})
