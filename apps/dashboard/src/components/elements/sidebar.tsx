"use client"

import { ChevronsUpDown, Contact, HelpCircle, Home, Keyboard, Mail, Plane, Search, Settings, Trash, User, Users } from "lucide-react"
import Link from "next/link"

export default function Sidebar() {
    return (
        <div className="hidden fixed left-0 top-0 bottom-0 lg:flex lg:w-[200px] xl:w-[250px] min-h-screen overflow-auto border-r-2  border-r-[#dddddddd] flex-col justify-between">
            <div className="space-y-3">
                {/* The account switch */}
                <div popoverTarget="account" className="border-2 mx-3 border-[#cccccccc] p-2 mt-3 bg-[#f4f4f4] rounded-xl flex justify-between items-center">
                    <User className="h-4 w-4" />
                    <p>henri</p>
                    <ChevronsUpDown className="h-4 w-4" />
                </div>
                <div className="flex flex-col mx-3">
                    <div className="flex items-center p-2  cursor-pointer hover:bg-[#f4f4f4] rounded-xl" onClick={console.log}>
                        <Search className="h-4 w-4 mr-3" />
                        <span className="text-sm">Search</span>
                    </div>
                </div>
                {/* The platform located links */}
                <div className="flex flex-col mx-3">
                    <div className="flex items-center">
                        <span className="text-[#666666] text-sm">Platform</span>
                        <hr className="border-2 border-[#cccccccc] w-full ml-2" />
                    </div>
                    <Link href="/" className="flex items-center p-2 w-full  hover:bg-[#f4f4f4] rounded-xl">
                        <Home className="h-4 w-4 mr-3" />
                        <span className="text-sm">Home</span>
                    </Link>
                    <Link href="/send" className="flex items-center p-2 w-full  hover:bg-[#f4f4f4] rounded-xl">
                        <Plane className="h-4 w-4 mr-3" />
                        <span className="text-sm">Send</span>
                    </Link>
                    <Link href="/team" className="flex items-center p-2 w-full  hover:bg-[#f4f4f4] rounded-xl">
                        <Users className="h-4 w-4 mr-3" />
                        <span className="text-sm">Teams</span>
                    </Link>
                    <Link href="/settings" className="flex items-center p-2 w-full  hover:bg-[#f4f4f4] rounded-xl">
                        <Settings className="h-4 w-4 mr-3" />
                        <span className="text-sm">Settings</span>
                    </Link>
                </div>
                <div className="flex flex-col mx-3">
                    <div className="flex items-center">
                        <span className="text-[#666666] text-sm">Aliases</span>
                        <hr className="border-2 border-[#cccccccc] w-full ml-2" />
                    </div>
                    <Link href="/settings" className="flex items-center p-2 w-full  hover:bg-[#f4f4f4] rounded-xl">
                        <Mail className="h-4 w-4 mr-3" />
                        <span className="text-sm">me@henri.gg</span>
                        <span className="h-2 w-2 rounded-full bg-green-400 ml-2" />
                    </Link>
                    <Link href="/settings" className="flex items-center p-2 w-full  hover:bg-[#f4f4f4] rounded-xl">
                        <Keyboard className="h-4 w-4 mr-3" />
                        <span className="text-sm">work@henri.gg</span>
                    </Link>
                    <Link href="/settings" className="flex items-center p-2 w-full  hover:bg-[#f4f4f4] rounded-xl">
                        <Trash className="h-4 w-4 mr-3" />
                        <span className="text-sm">spam@henri.gg</span>
                    </Link>
                </div>
            </div>
            <div className="mx-3 pb-4">
                <Link href="/help" className="text-sm flex items-center p-1 w-full rounded-xl">
                    <HelpCircle className="h-4 w-4 mr-3" />
                    <span>Help center</span>
                </Link>
                <Link href="/help" className="text-sm flex items-center p-1 w-full rounded-xl">
                    <Contact className="h-4 w-4 mr-3" />
                    <span>Contact</span>
                </Link>
                <hr className="border-2 border-[#cccccccc] w-full" />
                <div className="flex items-center">
                    <p>You are using the free plan.</p>
                    <span className="text-sm ml-4 text-[#f4f4f4]  bg-[#666666] h-min p-1 rounded-md cursor-pointer" onClick={console.log}>
                        upgrade
                    </span>
                </div>
            </div>
        </div>
    )
}