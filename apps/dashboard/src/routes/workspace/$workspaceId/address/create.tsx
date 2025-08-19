import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/workspace/$workspaceId/address/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/workspace/$workspaceId/address/create"!</div>
}
