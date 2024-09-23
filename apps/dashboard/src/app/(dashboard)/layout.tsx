import Sidebar from "@/components/elements/sidebar";
import { checkRequest } from "@/server/checkRequest";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const req = await checkRequest();
  return (
    <div className="flex min-h-screen bg-[#e8e8e8]">
      <Sidebar>{children}</Sidebar>
    </div>
  );
}
