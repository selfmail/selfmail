import "@/styles/globals.css";

import { type Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Generated by create-t3-app",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function Layout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div>
            {children}
        </div>
    );
}
