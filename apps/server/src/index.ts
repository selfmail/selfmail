import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import Handler from './handler'

export const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

Handler()

const port = 5000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
