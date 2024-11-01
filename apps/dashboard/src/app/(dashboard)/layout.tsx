import Sidebar from "@/components/elements/sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen text-foreground">
      <Sidebar team={"params.team"} username="henri">{children}</Sidebar>
    </div>
  );
}
