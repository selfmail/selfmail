import { checkRequest } from "@/server/checkRequest"
import { db } from "database"
import { ChevronLeft, Pen, Trash } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import TrashButton from "./trash-button"

/**
 * View a community article or guide.
 */
export default async function Help({
    params
}: {
    params: {
        id: string
    }
}) {
    if (!params.id) notFound()
    // the user from the session
    const req = await checkRequest()
    // the user in the db
    const user = await db.user.findUnique({
        where: {
            id: req.userId
        }
    })
    // no user is matching with the id in the cookies
    if (!user) redirect("/login")
    
    const article = await db.helpPost.findUnique({
        where: {
            id: params.id
        }
    })
    if (!article) notFound()
    return (
        <div className="mt-3 mx-3">
            <div className="flex items-center justify-between">
                <Link href="/help"><ChevronLeft className="h-4 w-4" /></Link>
                <div className="flex items-center space-x-3">
                    <p>{article.createdAt.toLocaleDateString()} {article.createdAt.toLocaleTimeString()}</p>
                    {/* Edit the article */}
                    {user.id === article.userId && (
                        <>
                            <TrashButton id={article.id} />
                            <Pen className="h-4 w-4" />
                        </>
                    )}
                </div>
            </div>
            <h1 className="text-4xl font-medium">
                {article.title}
            </h1>
            <p className="text-[#666666]">
                {article.description}
            </p>
            <hr />
            <p>{article.content}</p>
        </div>
    )
}