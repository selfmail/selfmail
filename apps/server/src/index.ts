import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import Handler from './handler'
import CheckConfig from './check-config'
import fs from 'node:fs'

/**
 * Variables which will be defined below and can be used everywhere in the app.
 */
type Variables = {
  /**
   * The html string for the error page.
   * This will be send to the sender if an error occures as an email.
   */
  error_html: string
}

export const app = new Hono<{ Variables: Variables }>()



app.use(async (c, next) => {
  /**
   * Set the error_html variable to the html string of the error page.
   * This will be send to the sender if an error occures as an email.
   */
  c.set("error_html", await fs.promises.readFile("../templates/error", "utf-8"))
  console.log(c.get("error_html"))
  await next()
})

app.get("/", (c) => {
  return c.html("Hello World")
})

Handler()
CheckConfig()

const port = 5000
console.log(`[i] Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
