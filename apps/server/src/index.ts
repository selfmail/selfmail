import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import Handler from './handler'
import CheckConfig from './check-config'

export const app = new Hono()

Handler()
CheckConfig()

const port = 5000
console.log(`[i] Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
