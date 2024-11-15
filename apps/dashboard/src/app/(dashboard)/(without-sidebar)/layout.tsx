import TeamSidebar from "@/components/team-sidebar";
import "@/styles/globals.css";

import { type Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Dashboard of selfmail.",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

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
