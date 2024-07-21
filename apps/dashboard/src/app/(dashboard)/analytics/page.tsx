import Link from "next/link";

// FIXME: not a priority feature of this platform
export default function Analytics() {
    return (
        <main className="min-h-screen bg-[#e8e8e8] p-3">
            <h1 className="text-3xl font-medium">Analytics</h1>
            <div className="flex items-center">
                <span className="h-2 w-2 bg-green-700 rounded-full animate-pulse mr-2"></span><p>We are working on this feature. <Link href={"https://github.com/i-am-henri/selfmail"} className="underline">Want to help?</Link></p>
            </div>
        </main>
    )
}