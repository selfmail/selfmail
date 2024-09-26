"use client"
import { useSidebarStore } from "@/components/elements/sidebar";
import Link from "next/link";

// FIXME: teams are priority, but not the biggest
export default function Analytics() {
    const { isOpen, toggleSidebar } = useSidebarStore()
    return (
        <main className="min-h-screen bg-[#e8e8e8] p-3">
            <h1 className="text-3xl font-medium">Teams</h1>
            <div className="flex items-center">
                <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-700" />
                <p>
                    We are working on this feature.{" "}
                    <Link
                        href={"https://github.com/i-am-henri/selfmail"}
                        className="underline"
                    >
                        Want to help?
                    </Link>
                </p>
            </div>
        </main>
    );
}
