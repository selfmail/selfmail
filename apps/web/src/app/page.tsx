import { Inbox, ToyBrick, Users } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { waitlist } from "./action";
import Form from "./form";
import Logo from "./logo";

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
        <Link href="/" className="text-[#666666] hover:text-black duration-200 h-5 w-5">
          <Logo />
        </Link>
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
        <Form action={waitlist} />
      </div>
      <hr className="border-black/10" />
      <div className="space-y-2">
        <h2 className="text-xl font-[450]">The missing piece</h2>
        <ScrollAnimation />
        <p className="text-[#121212]">Selfmail is made for you, your team and your family. We are providing a secure, private and easy to use email service with a great user experience and support.</p>
      </div>
      <div className="space-y-2 relative">
        <h2 className="text-xl font-[450]">The best editor</h2>
        <Image src="/editor.png" width={1000} height={1000} alt="editor" className="rounded-lg border border-[#e1e1e1]" />
        <p className="text-[#121212]">We provide you a notion-like, collaberative first text editor. You can write your emails faster and together with a big team in real time.</p>
      </div>
      <div className="space-y-2 relative">
        <h2 className="text-xl font-[450]">Team experience on a new level</h2>
        <Image src="/editor.png" width={1000} height={1000} alt="editor" className="rounded-lg border border-[#e1e1e1]" />
        <p className="text-[#121212]">The entire platform is open source, this means, you can easily selfhost selfmail on your own server. This makes it cheaper for teams and businesses to collaberate on emails.</p>
      </div>
      <div className="h-screen" />
    </main>
  );
}
