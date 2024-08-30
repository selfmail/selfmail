import Logo from "@/app/logo"
import FadeIn from "@/components/fade-in"
import Render from "@/components/render"
import { allChangelogs } from "content-collections"
import Link from "next/link"
import { notFound } from "next/navigation"

export default function ChangelogPost({
    params
}: {
    params: {
        slug: string
    }
}) {

    const post = allChangelogs.find((post) => post._meta.path === params.slug)

    // post not found, trigger 404 error
    if (!post) notFound()

    return (
        <div className="min-h-screen flex flex-col space-y-16 text-black  md:w-[450px] lg:w-[500px]">
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
                <FadeIn><h1 className="text-2xl font-medium text-yellow-800 pt-24">{post.title}</h1></FadeIn>
                <FadeIn variant={2}><p className="text-[#121212]">{post.summary}</p></FadeIn>
                <FadeIn variant={3}>
                    <Render code={post.mdx} />
                </FadeIn>
            </div>
            <FadeIn variant={4}>
                <footer className="flex flex-col md:flex-row justify-between items-center ">
                    <p className="text-[#121212] text-sm">© 2024 Selfmail. All rights reserved.</p>
                    <div className="flex space-x-2">
                        <Link href="/changelog" className="text-[#121212] text-sm">Changelog</Link>
                        <Link href="/privacy" className="text-[#121212] text-sm">Privacy</Link>
                        <Link href="/legal" className="text-[#121212] text-sm">Legal</Link>
                    </div>
                </footer>
            </FadeIn>
            <div className="h-16" />
        </div>
    )
}