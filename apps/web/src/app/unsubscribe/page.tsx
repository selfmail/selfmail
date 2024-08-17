import Link from "next/link";
import Logo from "../logo";

export default function UnsubscribePage() {
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
            <h1 className="text-2xl font-medium mt-[25%] text-blue-800">You habe been removed from the waitlist</h1>
            <p>Your actions have been recorded and you will be removed from the waitlist. You can resubscribe anytime by going back to the homepage <Link className="underline" href="/">here</Link>. Please also note, that you can subscribe to a specigic topic. For example, if you felt overhelmed by our emails, you can unsubscribe from them, but get notified when we launch.</p>
        </div>
    </main>
}