import Sidebar from "@/components/elements/sidebar";
import { checkRequest } from "@/server/checkRequest";
import { db } from "database";

export default async function DashboardLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const req = await checkRequest()
    const adresses = await db.adresse.findMany({
        where: {
            userId: req.userId
        },
        select: {
            email: true
        }
    })
    console.log(adresses)
    return (
        <div className="min-h-screen bg-[#e8e8e8] flex">
            {/* 
                The sidebar is hidden on mobile, a header will be rendered on top of the sidebar if
                you use a phone.
            */}
            <Sidebar adresses={adresses} />
            {/* The main content with a padding of 200px on the left. */}
            <div className="flex-1 p-3lg:pl-[200px] xl:pl-[250px]">
                {children}
            </div>
        </div>
    )
}