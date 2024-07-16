import { db } from "database";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Email({
    params
}: {
    params: {
        email: string;
    }
}) {
    const email = await db.email.findUnique({
        where: {
            id: params.email
        }
    })
    if (!email) notFound()
    console.log(email)
    return (
        <div>
            <header className="flex items-center justify-between">
                <div className="flex items-cener space-x-2">
                    <div className="flex items-center">
                        <Link href={"/"}><ChevronLeft className="w-4 h-4" /></Link>
                    </div>
                    <Link href={`/contacts/${email.sender}`}>{email.sender}</Link>
                </div>
                <p className="text-sm">{email.createdAt.toLocaleDateString()}</p>
            </header>
            <h1 className="text-2xl">{email.subject}</h1>
            <p className="text-[#666666]">{email.content}</p>
        </div>
    )
}