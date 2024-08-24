import { confirm } from "@clack/prompts"
import consola from "consola"
import { z } from "zod"
import { handleError } from "../actions/error"
import { link } from "../actions/link"
import { space } from "../actions/space"

export const remove = async () => {
    const confirmSchema = z.boolean()
    const textSchema = z.string()

    consola.info(`Removing your ${link("selfmail", "https://selfmail.app")} installation...`)

    space()

    const confirmation = await confirm({
        message: "Are you sure you want to remove your selfmail installation?",
    })

    const confirmParse = await confirmSchema.safeParseAsync(confirmation)

    if (!confirmParse.success) {
        handleError("You have to confirm the removal of your selfmail installation. Otherwise we will not remove it.")
    }


    const env = await confirm({
        message: "Have you copied all of the important environment variables from the selfmail installation? If not, please do so before removing the installation.",
    })

    const envParse = await confirmSchema.safeParseAsync(env)

    if (!envParse.success) {
        handleError("You can now copy all of the important environment variables from the selfmail installation.")
    }

    space()

    consola.info("Removing your selfmail installation...")



}