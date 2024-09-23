import Sidebar from "@/components/elements/sidebar";
import { checkRequest } from "@/server/checkRequest";
import { db } from "database";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const req = await checkRequest();
  const adresses = await db.adresse.findMany({
    where: {
      userId: req.userId,
    },
    select: {
      email: true,
    },
  });
  return (
    <div className="flex min-h-screen bg-[#e8e8e8]">
      <Sidebar>{children}</Sidebar>
    </div>
  );
}
