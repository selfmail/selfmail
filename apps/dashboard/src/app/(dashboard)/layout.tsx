import Sidebar from "@/components/elements/sidebar";
import { getSidebarLinks } from "./action";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen text-foreground">
      <Sidebar getTeams={getSidebarLinks} getSidebarLinks={getSidebarLinks}>{children}</Sidebar>
    </div>
  );
}
