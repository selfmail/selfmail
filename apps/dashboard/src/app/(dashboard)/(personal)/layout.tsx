import TeamSidebar from "@/components/team-sidebar";
import UserPageTracking from "@/components/user-page-tracking";
import UserSidebar from "@/components/user-sidebar";
import "@/styles/globals.css";

import { type Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Dashboard of selfmail.",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function Layout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex min-h-screen w-full">
            <TeamSidebar user={{
                name: "Henri",
                color: "#343434",
            }} teams={[{
                name: "Selfmail",
                color: "#22c55e",
                slug: "selfmail"
            }]} />
            <UserPageTracking />
            <UserSidebar />
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
}
