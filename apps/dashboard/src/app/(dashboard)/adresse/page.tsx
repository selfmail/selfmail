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
        <div>
            {
                adresses.map((adresse) => (
                    <p>{adresse.email}: {adresse.type}: {adresse.userId}</p>
                ))
            }
        </div>
    )
}