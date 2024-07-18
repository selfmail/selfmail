import { checkRequest } from "@/server/checkRequest"
import { db } from "database"
import { ChevronLeft, Pen, Trash } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import TrashButton from "./trash-button"
import { Button, Dialog, DialogContent, DialogTrigger, Input } from "ui"
import { z } from "zod"
import { userAgent } from "next/server"

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
    const articleUser = await db.user.findUnique({
        where: {
            id: article.userId
        }
    })
    if (!articleUser) throw new Error("The author of this post can't be found.")
    return (
        <div className="mt-3 mx-3">
            <div className="flex items-center justify-between">
                <Link href="/help"><ChevronLeft className="h-4 w-4" /></Link>
                <div className="flex items-center space-x-3">
                    <p>{article.createdAt.toLocaleDateString()} {article.createdAt.toLocaleTimeString()}</p>
                    {/* User is a mod, he can now also moderat this post. If this post is from another mod or admin, he can't
                        edit this post.
                     */}
                    {(user.role === ("mod" || "admin") && articleUser.role !== "mod") && (
                        <>
                            {/* Deletion of a post can be only handled with a reason. When
                                a post is deleted, it will be saved into another model. If the 
                                deletion is approved, it will be permanentely deleted. */}
                            <Dialog>
                                <DialogTrigger>
                                    Delete
                                </DialogTrigger>
                                <DialogContent>
                                    <form action={deletePostByMod}>
                                        <Input placeholder="The reason"/>
                                        <Button type="submit">
                                            Submit
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </>
                    )}
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
/**
 * 
 * @param e {FormData}
 * @param {String} id the id of the post 
 * @param {String} userId the id of the user, from which the psot will be deleted
 * @param {String} modId the id of the mod, which delets the post
 */
async function deletePostByMod(e: FormData, id: string, userId: string, modId: string) {
    "use server"

    const formDataSchema = z.object({
        reason: z.string()
    })

    const parse = await formDataSchema.safeParseAsync({
        reason: e.get("reason") as string
    })

    if (!parse.success) {
        throw new Error("Validation Error: the input field \"reason\" is not matching the type string.")
    }

    const post = await db.helpPost.findUnique({
        where: {
            id
        }
    })

    const deletedPost = await db.deletedHelpPost.create({
        data: {
            ...post,     
            userId
        }
    })
    const deletion = await db.helpPost.delete({
        where: {
            id
        }
    })
    
}