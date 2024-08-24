import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="w-full mx-2 sm:mx-5 md:w-[500px] md:mx-0 lg:w-[650px] min-h-screen">
            <h1 className="text-3xl font-medium">About selfmail</h1>
            <p>Selfmail newsletter is a professional tool to create and maintain your newsletters. It's easy to use and understand, so you can focus on creating content that resonates with your audience. We are working on this tool since the august of 2024. You can find the source code on <Link href="https://github.com/selfmail-app/selfmail">GitHub</Link>.</p>
        </div>
    )
}