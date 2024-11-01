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
    <div className={cn("flex flex-col space-y-16 min-h-screen lg:w-[500px]", sans.className)}>
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
      <div className="space-y-3 pt-36">
        {/* <Image src="/selfmail-logo.png" alt="selfmail screenshot" width={250} height={500} /> */}
        <h1 className="text-3xl font-bold">
          👋 Welcome on the selfhosted version of selfmail
        </h1>
        <p>We created an smtp server in typescript for our platform. This server is <Link href="https://github.com/selfmail/selfmail" className="underline" target="_blank">open source</Link> and
          you can use it for your own projects. This server will be used by the hosted version and you can use it to selfhost selfmail. </p>
      </div>
      <div>
        <h2 className="text-2xl font-bold">
          Tutorial
        </h2>
        <p></p>
      </div>
      <div>
        <h2 className="text-2xl font-bold">
          Features
        </h2>
        <p>Selfmail comes with a lot of features, on the frontend and on the backend.</p>
      </div>
    </div>
  )
}