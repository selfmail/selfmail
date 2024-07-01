"use client"

import Link from "next/link"
import BoxLight from "@/../public/box-light.svg"
import BoxDark from "@/../public/box.svg"
import { useTheme } from "next-themes"
import Img from "next/image"
export default function Header() {
    const theme = useTheme()
    return (
        <div className="w-full h-14 flex items-center justify-between">
            <h2 className="text-xl font-medium flex">
                {theme.theme === "dark"? <Img className="mr-2" height={25} width={25} alt="out light logo" src={BoxLight} />: <Img className="mr-2" height={25} width={25} alt="our dark logo" src={BoxDark} />}
                selfmail</h2>
            <nav className="space-x-2">
                <Link className="text-[#282828] hover:text-[#111011] dark:text-[#e1e1e1] hover:dark:text-[#f5f5f5] transition" href={"/pricing"}>
                    Pricing
                </Link>
                <Link className="text-[#282828] hover:text-[#111011] dark:text-[#e1e1e1] hover:dark:text-[#f5f5f5] transition" href={"/selfhost"}>
                    Selfhost
                </Link>
                <Link className="text-[#282828] hover:text-[#111011] dark:text-[#e1e1e1] hover:dark:text-[#f5f5f5] transition" href={"/login"}>
                    Login
                </Link>
                <Link className="text-[#282828] hover:text-[#111011] dark:text-[#e1e1e1] hover:dark:text-[#f5f5f5] transition" href={"/register"}>
                    Register
                </Link>
            </nav>
        </div>
    )
}