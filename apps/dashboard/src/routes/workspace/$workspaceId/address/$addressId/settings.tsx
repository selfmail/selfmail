import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/workspace/$workspaceId/address/$addressId/settings',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/workspace/$workspaceId/address/$addressId/settings"!</div>
}
