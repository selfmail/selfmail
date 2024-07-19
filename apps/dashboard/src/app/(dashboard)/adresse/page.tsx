import { checkRequest } from "@/server/checkRequest"
import { db } from "database"
import { User } from "lucide-react"
import { redirect } from "next/navigation"

/**
 * Manage you adresses on this page.
 * @returns {JSX.Element}
 */
export default async function Adresse(): Promise<JSX.Element> {
    const req = await checkRequest()
    const user = await db.user.findUnique({
        where: {
            id: req.userId
        }
    })
    if (!user) redirect("/login")
    const adresses = await db.adresse.findMany({
        where: {
            userId: user.id
        }
    })
    return (
        <div className="mx-3 mt-3">
            <h2 className="text-3xl font-medium">Your Adresses <span className="text-[#666666]">{adresses.length}</span></h2>
            {
                adresses.map((adresse) => (
                    <p>{adresse.email}: {adresse.type}: {adresse.userId}</p>
                ))
            }
        </div>
    )
}