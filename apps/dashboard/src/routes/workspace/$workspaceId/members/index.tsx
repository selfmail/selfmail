import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/workspace/$workspaceId/members/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/workspace/$workspaceId/members/"!</div>
}
