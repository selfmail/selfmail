import Sidebar from "@/components/sidebar";
import TeamSidebar from "@/components/team-sidebar";
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
            <TeamSidebar teams={[
                {
                    name: "Selfmail",
                    color: "#22c55e",
                    slug: "selfmail"
                }
            ]} user={{
                name: "Henri",
                color: "#343434",
            }} />
            <Sidebar activeTeam={undefined} userDetails={{
                name: "Henri",
                color: "#343434",
                email: "henri@selfmail.app",
            }} adresses={[]} />
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
}
