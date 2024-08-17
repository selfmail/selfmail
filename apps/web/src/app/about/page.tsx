import Link from "next/link";
import Logo from "../logo";

export default function AboutPage() {
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
                <h2 className=" text-2xl font-medium mt-[25%]">About selfmail...</h2>
                <p className="text-[#121212] ">We are developing this platform since the june of 2024. This project was initially started by <Link className="underline" href="https://henri.gg" target="_blank">henri</Link>.</p>
            </div>
        </main>
    );
}