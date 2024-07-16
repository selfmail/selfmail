import { db } from "database";
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
            <header>
                <h1 className="text-2xl">{email.sender}</h1>
                <p className="text-sm">{email.createdAt.toLocaleDateString()}</p>
            </header>
            <h1 className="text-2xl">{email.subject}</h1>
            <p className="text-[#666666]">{email.content}</p>
        </div>
    )
}