import { confirm } from "@clack/prompts"
import { exec } from "child_process"
import consola from "consola"
import util from "util"
import { z } from "zod"
import { handleError } from "../actions/error"
import { space } from "../actions/space"
const asyncExec = util.promisify(exec)


// TODO: add the logic to update the packages
export const update = async () => {
    const confirmSchema = z.boolean()
    const textSchema = z.string()

    consola.info("Updating your selfmail package...")
    space()

    const license = await confirm({
        message: "Have you read our license and TOS and accepting these?"
    })

    const licenseParse = await confirmSchema.safeParseAsync(license)

    if (!licenseParse.success) {
        handleError("Process aborted.Please accept our license.")
    }

    // copy the .env files and the config file
    consola.info("Copying the .env files and the config file...")


    space()
    // pulling the repository
    consola.info("Pulling the git repository...")

    // installing the packages
    consola.info("Installing the packages...")

    // inserting the copy of the config file
    consola.info("Inserting the copy of the config file...")

    // inserting the copy of the .env files
    consola.info("Inserting the copy of the .env files...")

    // update the config file
    consola.info("Updating the config file...")
}