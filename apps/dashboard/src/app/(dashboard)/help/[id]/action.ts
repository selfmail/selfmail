"use server"

import { db } from "database"
import { redirect } from "next/navigation"
import { z } from "zod"

/**
 * Deletes a post from the user.
 * @param {string} id the id of the post, which should be deleted 
 */
export async function deletePost(id: string) {
    const del = await db.helpPost.delete({
        where: {
            id
        }
    })
    redirect("/help")
}
/**
* 
* @param {FormData} e
* @param {String} id the id of the post 
* @param {String} userId the id of the user, from which the psot will be deleted
* @param {String} modId the id of the mod, which delets the post
*/
export async function deletePostByMod(e: FormData, id: string, userId: string, modId: string) {
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
           ...post!,     
           userId,
           modId
       }
   })
   const deletion = await db.helpPost.delete({
       where: {
           id
       }
   })
   
}

export async function createComment(prevState: unknown, e: FormData): Promise<{
    message: string | undefined,
    error: string | undefined
}> {
    return {
        message: "all ok",
        error: undefined
    }
}