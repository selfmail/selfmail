"use client"

import { cn } from "@/lib/cn"
import { DocumentChartBarIcon } from "@heroicons/react/24/outline"
import { BarChart, DollarSign, Heart, Inbox, LucideSpeech, Settings, SidebarClose, Users } from "lucide-react"
import { SidebarLink, useSidebarStore } from "./sidebar"

export default function UserSidebar() {
    const { state, setState } = useSidebarStore()
    return (
        <aside className={cn("sticky top-0 flex flex-col h-screen w-[280px] bg-background border-r border-border", state ? "" : "hidden")}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-sky-500 rounded-lg flex items-center justify-center">
                        {/* Logo */}
                    </div>
                    <div>
                        <h2 className="text-[15px] font-medium text-text-primary">Personal Dashboard</h2>
                    </div>
                </div>
                <button onClick={() => setState(false)} aria-label="Close Sidebar">
                    <SidebarClose className="w-4 h-4 text-text-secondary" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3">
                <div className="space-y-0.5 py-2">
                    <SidebarLink item={{
                        icon: Inbox,
                        name: "Inbox",
                        count: 120
                    }} />
                    <SidebarLink item={{
                        icon: DollarSign,
                        name: "Plan",
                    }} />
                    <SidebarLink item={{
                        icon: Settings,
                        name: "Settings",
                    }} />
                    <SidebarLink item={{
                        icon: Users,
                        name: "Teams",
                    }} />
                </div>

                <div className="mt-6">
                    <div className="px-3 py-1.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Analytics
                    </div>
                    <div className="mt-1 space-y-0.5">
                        <SidebarLink item={{
                            icon: BarChart,
                            name: "User Analytics",
                        }} />
                        <SidebarLink item={{
                            icon: DocumentChartBarIcon,
                            name: "Emails",
                        }} />
                    </div>
                </div>

                <div className="mt-6">
                    <div className="px-3 py-1.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Platform
                    </div>
                    <div className="mt-1 space-y-0.5">
                        <SidebarLink item={{
                            icon: LucideSpeech,
                            name: "Feedback",
                        }} />
                        <SidebarLink item={{
                            icon: Heart,
                            name: "Donate",
                        }} />
                    </div>
                </div>
            </nav>

            {/* Bottom Items */}
            <div className="border-t border-t-border">
                {/* User Profile */}
                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-background-tertiary ring-1 ring-border">
                            {/* User profile icon */}
                        </div>
                        <div>
                            <div className="font-medium text-[var(--text-primary)]">Julia Chang</div>
                            <div className="text-sm text-neutral-400">juliachang@gmail.com</div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}