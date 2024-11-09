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
        <div className="min-h-screen flex flex-col">
            {children}
        </div>
    );
}
