import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/otp/backup-codes/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/otp/backup-codes/"!</div>
}
