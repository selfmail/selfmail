import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "ui";

export default function Send() {
    return (
        <main className="min-h-screen bg-[#e8e8e8]">
            <header className="flex items-center justify-between">
                <div className="flex items-cener space-x-2">
                    <div className="flex items-center">
                        <Link href={"/"}><ChevronLeft className="w-4 h-4" /></Link>
                    </div>
                </div>
                <div className="flex items-center">
                    <Button>send</Button>
                </div>
            </header>

        </main>
    )
}