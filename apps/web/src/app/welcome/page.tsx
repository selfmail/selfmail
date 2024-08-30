import Link from "next/link";
import Logo from "../logo";

export default function WelcomePage() {
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
            <h1 className="text-2xl font-medium pt-24 text-green-800">Welcome to the waitlist</h1>
            <p>Welcoem to the waitlist! We are sending you updates on our progress every month and (of course) you can unsubscribe anytime. Below you can manage your subscriptions (which emails you want to receive).</p>
        </div>
    </main>
}