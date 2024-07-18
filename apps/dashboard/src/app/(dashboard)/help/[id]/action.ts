"use server"

import { db } from "database"
import { z } from "zod"

export async function deletePost(id: string) {
    const del = await db.helpPost.delete({
        where: {
            id
        }
    })
}
/**
* 
* @param e {FormData}
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