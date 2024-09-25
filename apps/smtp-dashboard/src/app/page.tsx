import { cn } from "@/lib/utils";
import { Instrument_Sans } from "next/font/google";
import Link from "next/link";

const sans = Instrument_Sans({
  style: "normal",
  weight: "400",
  subsets: ["latin"],
})
export default function Homepage() {
  return (
    <div className={cn("flex flex-col space-y-16 min-h-screen w-[500px]", sans.className)}>
      <header className="flex justify-between w-full items-center h-16">
        <Link href="/" className="flex font-mediumtext-black duration-200 ">
          selfmail smtp
        </Link>
        <nav className="space-x-2">
          <Link href="/" className="text-[#666666] hover:text-black duration-200">
            Home
          </Link>
          <Link href="/login" className="text-[#666666] hover:text-black duration-200">
            Login
          </Link>
        </nav>
      </header>
      <p>We created an smtp server in typescript for our platform. This server is <Link href="https://github.com/selfmail/selfmail" className="underline" target="_blank">open source</Link> and
        you can use it for your own projects. This server will be used by the hosted version and you can use it to selfhost selfmail. </p>
    </div>
  )
}