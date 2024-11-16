import TeamSidebar from "@/components/team-sidebar";

export default function Layout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex min-h-screen w-full">
            <TeamSidebar />
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
}
