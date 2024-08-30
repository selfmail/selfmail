import Link from "next/link";
import Logo from "../logo";

export default function ErrorPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] };
}) {
    const error = searchParams.error || "Unknown error";
    return <main className="min-h-screen flex flex-col space-y-16 text-black md:w-[450px] lg:w-[500px]">
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
            <h1 className="text-2xl font-medium  pt-24 text-red-800">We had an Error</h1>
            <p>An error occured while processing your request. Please try again later or contact us for support <Link href="/contact" className="underline">here</Link>.</p>
            <p className="text-red-500">{error}</p>
        </div>
    </main>
}