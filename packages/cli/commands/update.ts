import { confirm } from "@clack/prompts"
import consola from "consola"
import { space } from "../actions/space"

export const update = async () => {
    consola.info("Updating your selfmail package...")
    space()
    const requirements = await confirm({
        message: "Have you installed git and pnpm?"
    })
    if (!requirements) {
        // TODO: install terminal link
        consola.error("You need to have git and pnpm installed. Read more about here.")
        process.exit(1)
    }
    const license = await confirm({
        message: "Have you read our license and TOS and accepting these?"
    })
    if (!license) {
        // TODO: install terminal link
        consola.error("You need to accept our license. You can read about our license here.")
        process.exit(1)
    }

    // pulling the repository
    space()
    consola.info("Pulling the git repository...")
}