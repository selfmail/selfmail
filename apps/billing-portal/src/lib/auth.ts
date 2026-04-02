import { SessionUtils } from '@selfmail/auth'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const PROD_AUTH_HREF = 'https://auth.selfmail.app/login'
const DEV_AUTH_HREF = 'http://auth.selfmail.localhost:1355/login'

export const getCurrentUserFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const user = await SessionUtils.getCurrentUser()

  if (!user) {
    throw redirect({
      href: getLoginHref(),
    })
  }

  return user
})

export const getLoginHref = () => {
  if (typeof window === 'undefined') {
    return process.env.SELFMAIL_AUTH_URL
      ? new URL('/login', process.env.SELFMAIL_AUTH_URL).toString()
      : DEV_AUTH_HREF
  }

  return window.location.hostname.endsWith('.selfmail.app') ||
    window.location.hostname === 'selfmail.app'
    ? PROD_AUTH_HREF
    : DEV_AUTH_HREF
}
