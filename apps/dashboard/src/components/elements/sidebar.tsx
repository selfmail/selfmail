"use client"

import { BarChart, ChevronsUpDown, Contact, HandCoins, HelpCircle, Home, Inbox, Keyboard, Mail, Mailbox, Plane, Search, Settings, Trash, User, Users } from "lucide-react"
import Link from "next/link"

export default function Sidebar({
    adresses
}: {
    adresses: { email: string }[]
}) {
    return (
        <div className="hidden fixed left-0 top-0 bottom-0 lg:flex lg:w-[200px] xl:w-[250px] min-h-screen overflow-auto border-r-2  border-r-[#dddddddd] flex-col justify-between">
            <div className="space-y-3">
                {/* The account switch */}
                <div className="border-2 mx-3 border-[#cccccccc] p-2 mt-3 bg-[#f4f4f4] rounded-xl flex justify-between items-center">
                    <User className="h-4 w-4" />
                    <p>henri</p>
                    <ChevronsUpDown className="h-4 w-4" />
                </div>
                <div className="flex flex-col mx-3">
                    <div className="flex items-center p-2 justify-between cursor-pointer hover:bg-[#f4f4f4] rounded-xl">
                        <div className="flex">
                            <Search className="h-4 w-4 mr-3" />
                            <span className="text-sm">Search</span>
                        </div>
                        <span className="text-sm bg-[#f5f5f5] text-black px-[4px] rounded-md border-b border-b-[#e5e5e5] ring-1 ring-[#d4d4d4]">
                            ⌘ K
                        </span>
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
                    <Link href="/upgrade" className="flex items-center p-2 w-full  hover:bg-[#f4f4f4] rounded-xl">
                        <HandCoins className="h-4 w-4 mr-3" />
                        <span className="text-sm">Upgrade</span>
                    </Link>
                    <Link href="/analytics" className="flex items-center p-2 w-full  hover:bg-[#f4f4f4] rounded-xl">
                        <BarChart className="h-4 w-4 mr-3" />
                        <span className="text-sm">Analytics</span>
                    </Link>
                    <Link href="/adresse" className="flex items-center p-2 w-full  hover:bg-[#f4f4f4] rounded-xl">
                        <Mailbox className="h-4 w-4 mr-3" />
                        <span className="text-sm">Adresses</span>
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
                    {
                        adresses.map((adresse) => (
                            <Link href={`/adresse/${adresse.email}`} className="flex items-center p-2 w-full  hover:bg-[#f4f4f4] rounded-xl">
                                <Inbox className="h-4 w-4 mr-3" />
                                <span className="text-sm">{adresse.email}</span>
                            </Link>
                        ))
                    }
                </div>
            </div>
            <div className="mx-3 pb-4">
                <Link href="/help" className="text-sm flex items-center p-1 w-full rounded-xl">
                    <HelpCircle className="h-4 w-4 mr-3" />
                    <span>Help center</span>
                </Link>
                <Link href="/contact" className="text-sm flex items-center p-1 mb-1 w-full rounded-xl">
                    <Contact className="h-4 w-4 mr-3" />
                    <span>Contact</span>
                </Link>
                <hr className="border-2 border-[#cccccccc] w-full" />
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                        <p>free plan </p><span className="ml-2 rounded-full animate-pulse h-2 w-2 bg-[#555555]" />
                    </div>
                    <span className="text-sm ml-4 text-[#f4f4f4]  bg-[#666666] h-min p-1 rounded-md cursor-pointer">
                        upgrade
                    </span>
                </div>
            </div>
        </div>
    )
}