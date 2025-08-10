import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/legal/tos')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/legal/tos"!</div>
}
