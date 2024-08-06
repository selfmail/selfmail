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
      {/* 
        The sidebar is hidden on mobile, a header will be rendered on top of the sidebar if
        you use a phone.
            */}
      <Sidebar adresses={adresses} />
      {/* The main content with a padding of 200px on the left. */}
      <div className="p-3lg:pl-[200px] flex-1 xl:pl-[250px]">{children}</div>
    </div>
  );
}
