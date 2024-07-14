import Sidebar from "@/components/elements/sidebar";

export default function DashboardLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="min-h-screen bg-[#e8e8e8] flex">
            {/* 
                The sidebar is hidden on mobile, a header will be rendered on top of the sidebar if
                you use a phone.
            */}
            <Sidebar />
            {/* The main content with a padding of 200px on the left. */}
            <div className="flex-1 p-3lg:pl-[200px] xl:pl-[250px]">
                {children}
            </div>
        </div>
    )
}