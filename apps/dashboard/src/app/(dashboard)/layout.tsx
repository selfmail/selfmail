import Sidebar from "@/components/elements/sidebar";

export default async function DashboardLayout({
  children,
  params
}: Readonly<{ children: React.ReactNode }> & {
  params: {
    team: string | undefined
  }
}) {
  return (
    <div className="flex min-h-screen text-foreground">
      <Sidebar team={params.team} >{children}</Sidebar>
    </div>
  );
}
