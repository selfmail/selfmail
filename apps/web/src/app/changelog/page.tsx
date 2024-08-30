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
            {
                allChangelogs.map((post) => (
                    <div className="flex flex-col space-y-2" key={post._meta.fileName}>
                        <Link href={`/changelog/${post._meta.fileName}`}>
                            <h2 className="text-xl font-[450]">{post.title}</h2>
                        </Link>
                        <p className="text-[#121212]">{post.title}</p>
                        <p className="text-[#666666]">{post.summary}</p>
                    </div>
                ))
            }
        </div>
    )
}