import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/$workspaceSlug/_workspace/dev/')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  return <div>Hello "/_authed/$workspaceSlug/_workspace/dev/"!</div>
}
