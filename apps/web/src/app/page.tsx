import { Inbox, ToyBrick, Users } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button, EmailInput } from "ui";

const ScrollAnimation = dynamic(() => import("./animation"), {
  ssr: false, loading: () => <div id="svg-container" className="flex space-x-2">
    <Inbox className="text-[#666666] h-5 w-5" />
    <Users className="text-[#666666] h-5 w-5" />
    <ToyBrick className="text-[#666666] h-5 w-5" />
  </div>
});

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col space-y-16 text-black md:w-[450px] lg:w-[500px]">
      <header className="flex justify-between items-center h-16">
        <h3 className="text-[#66666]">
          s
        </h3>
        <nav className="space-x-2">
          <Link href="/" className="text-[#666666] hover:text-black duration-200">
            Home
          </Link>
          <Link href="/about" className="text-[#666666] hover:text-black duration-200">
            About
          </Link>
        </nav>
      </header>
      <div className="space-y-2">
        <h2 className=" text-2xl font-medium mt-[50%]">Open source email experience</h2>
        <p className="text-[#121212] ">Selfmail is a collaberative email provider, proudly open source. Sign the waitlist below to get notified when we launch.</p>
        <div className="relative flex items-center">
          <EmailInput placeholder="Your email" className="w-full" />
          <Button className="absolute right-2">
            Send
          </Button>
        </div>
      </div>
      <hr className="border-black/10" />
      <div className="space-y-2">
        <h2 className="text-xl font-[450]">The missing piece</h2>
        <ScrollAnimation />
        <p className="text-[#121212]">Selfmail is made for you, your team and your family. We are providing a secure, private and easy to use email service with a great user experience and support.</p>
      </div>
      <div className="h-screen" />
    </main>
  );
}
