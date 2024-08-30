import FadeIn from "@/components/fade-in";
import Link from "next/link";
import Logo from "./logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative space-y-2 text-black md:w-[450px] lg:w-[500px]">
      <div className="absolute top-0 w-full">
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
      </div>
      <FadeIn variant={1}>
        <p className="text-[#666666]">
          Searched in the entiry site, but found nothing... 404
        </p>
      </FadeIn>
      <FadeIn variant={2}>
        <p className="text-sm text-[#666666]">If this page should exist, please contact us.</p>
      </FadeIn>
    </div>
  );
}
