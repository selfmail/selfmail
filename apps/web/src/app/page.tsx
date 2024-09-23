import FadeIn from "@/components/fade-in";
import { Inbox, ToyBrick, Users } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { waitlist } from "./action";
import Form from "./form";
import Github from "./icons/github";
import X from "./icons/x";
import Logo from "./logo";

const ScrollAnimation = dynamic(() => import("./animation"), {
  ssr: false, loading: () => <div id="svg-container" className="hidden md:flex space-x-2">
    <Inbox className="text-[#666666] h-5 w-5" />
    <Users className="text-[#666666] h-5 w-5" />
    <ToyBrick className="text-[#666666] h-5 w-5" />
  </div>
});

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col space-y-16 text-black  md:w-[450px] lg:w-[500px]">
      <FadeIn variant={1}>
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
      </FadeIn>
      <FadeIn variant={2}>
        <div className="space-y-2">
          <h2 className=" text-2xl font-medium mt-[50%]">Open source email experience</h2>
          <p className="text-[#121212] ">Selfmail is a collaberative email provider, proudly open source. Sign the waitlist below to get notified when we launch.</p>
          <Form action={waitlist} />
        </div>
      </FadeIn>
      <FadeIn variant={3}>
        <hr className="border-black/10" />
      </FadeIn>
      <FadeIn variant={4}>
        <div className="space-y-2">
          <h2 className="text-xl font-[450]">The missing piece</h2>
          <ScrollAnimation />
          <p className="text-[#121212]">Selfmail is made for you, your team and your family. We are providing a secure, private and easy to use email service with a great user experience and support.</p>
        </div>
      </FadeIn>
      <FadeIn className="space-y-16" variant={5}>
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
        <div className="space-y-2 relative">
          <h2 className="text-xl font-[450]">Make it yours!</h2>
          <Image src="/editor.png" width={1000} height={1000} alt="editor" className="rounded-lg border border-[#e1e1e1]" />
          <p className="text-[#121212]">You can use our api to create your own frontend. And it's completely up to you, which frontend you want to use. We have an example for an selfmail client <Link href="https://github.com/selfmail/grids" className="underline">here</Link>. This is "grids", a minimalistic selfmail client, based on the selfmail api and the official sselfmail SDKs.</p>
        </div>
        <div className="space-y-2 relative">
          <h2 className="text-xl font-[450]">The company lover</h2>
          <Image src="/editor.png" width={1000} height={1000} alt="editor" className="rounded-lg border border-[#e1e1e1]" />
          <p className="text-[#121212]">You want to use selfmail seriously in your company? We have you covered! You can not only collaberate with your team on selfmail, you can also write entire newsletters with the <Link href="https://newsletter.selfmail.app" className="underline">selfmail newsletter tool</Link>!</p>
        </div>
      </FadeIn>
      <FadeIn variant={6}>
        <div className="border border-[#d1d1d1] text-[#121212] bg-[#f4f4f4] p-2 rounded-lg">
          <span className="font-thin text-sm absolute -right-7 bg-yellow-300 p-1 rounded-md rotate-45 top-1">coming soon</span>
          <h2 className="text-lg">Pricing</h2>
          <div className="w-full flex space-x-2">
            <div className="w-full flex flex-col space-y-2">
              <h2 className="text-2xl font-medium">
                0€
              </h2>
              <p>The free plan gives you everything you need to get started. This plan will stay for free forever.</p>
            </div>
            <div className="h-full w-[1px] bg-foreground mx-2" />
            <div className="w-full flex flex-col space-y-2">
              <h2 className="text-2xl font-medium">10€ <span className="font-normal text-base">/ user</span></h2>
              <p>The paid plan gives you more features, for your team and your family. You will help us to improve selfmail.</p>
            </div>
          </div>
        </div>
      </FadeIn>
      <FadeIn variant={7}>
        <footer className="flex flex-col md:flex-row justify-between items-center ">
          <p className="text-[#121212] text-sm">© 2024 Selfmail. All rights reserved.</p>
          <div className="flex space-x-2">
            <Link href="/changelog" className="text-[#121212] text-sm">Changelog</Link>
            <Link href="/privacy" className="text-[#121212] text-sm">Privacy</Link>
            <Link href="/legal" className="text-[#121212] text-sm">Legal</Link>
            <Link href="https://github.com/selfmail/selfmail" target="_blank" className="text-sm"><Github color="#121212" className="h-4 w-4 text-[#121212]" /></Link>
            <Link href="https://x.com" target="_blank" className="text-sm"><X color="#121212" className="h-4 w-4 text-[#121212]" /></Link>
          </div>
        </footer>
      </FadeIn>
      <div className="h-16" />
    </main>
  );
}
