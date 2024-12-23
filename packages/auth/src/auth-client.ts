import { adminClient, organizationClient, usernameClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: "http://localhost:4000",
    plugins: [
        organizationClient(),
        adminClient(),
        usernameClient()
    ]
})