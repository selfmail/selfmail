import FadeIn from "@/components/fade-in";
import { allChangelogs } from "content-collections";
import Link from "next/link";
import Logo from "../logo";
export default function Changelog() {
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
            <div className="pt-24">
                <FadeIn><h2 className="text-2xl font-medium  text-indigo-800">Changelog</h2></FadeIn>
                <FadeIn variant={2}><p>The official selfmail changelog. You can subscribe to changes to get an fresh email every time we release an update.</p></FadeIn>
            </div>
            {
                allChangelogs.map((post, i) => (
                    <FadeIn variant={i + 3} className="flex flex-col space-y-2" key={post._meta.fileName}>
                        <hr className="border-t border-t-[#8b8b8b] w-full" />
                        <div className="w-full flex justify-between h-12 rounded-b-md px-2 items-center sticky top-0 bg-[#e8e8e8]/80 backdrop-blur-sm">
                            <h2 className="text-[#121212] text-lg">{post.title}</h2>
                            <p className="text-[#121212] text-sm font-[450]">{post.date.toLocaleDateString()}</p>
                        </div>
                        <div className="text-[#666666]" dangerouslySetInnerHTML={{ __html: post.html }} />
                        <div className="w-full flex items-center justify-between">
                            <Link className="text-[#666666] hover:text-black duration-200" href={`/changelog/${post._meta.fileName}`}>Read more</Link>
                            <Link className="text-[#666666] hover:text-black duration-200" href="/changelog">Share</Link>
                        </div>
                    </FadeIn>
                ))
            }
        </div>
    )
}