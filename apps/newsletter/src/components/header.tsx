import Link from "next/link";

export default function Header() {
    return (
        <div className="flex justify-between h-12 items-center">
            <h2>Newsletter</h2>
            <div className="flex space-x-2">
                <Link href="/create">Create</Link>
                <Link href="/about">About</Link>
                <Link href="/pricing">Pricing</Link>
            </div>
        </div>
    )
}