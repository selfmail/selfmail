"use client"

import { ChevronsUpDown, User } from "lucide-react"
import Link from "next/link"

export default function Sidebar() {
    return (
        <div className="hidden fixed left-0 top-0 bottom-0 lg:block lg:w-[200px] xl:w-[250px] min-h-screen overflow-auto border-r-2 space-y-3 border-r-[#dddddddd]">
            {/* The account switch */}
            <div popoverTarget="account" className="border-2 mx-3 border-[#cccccccc] p-2 mt-3 bg-[#f4f4f4] rounded-xl flex justify-between items-center">
                <User className="h-4 w-4" />
                <p>henri</p>
                <ChevronsUpDown className="h-4 w-4" />
            </div>
            {/* The platform located links */}
            <div className="flex flex-col mx-3">
                <Link href="/henri">henri</Link>
            </div>
        </div>
    )
}