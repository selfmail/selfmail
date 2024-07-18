import { db } from "database"
import { notFound } from "next/navigation"

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
    
    const article = await db.helpPost.findUnique({
        where: {
            id: params.id
        }
    })
    if (!article) notFound()
    return (
        <div className="mt-3 mx-3">
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