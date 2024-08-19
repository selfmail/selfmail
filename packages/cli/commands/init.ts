import { execSync } from "child_process"
import { Command } from "commander"
import consola from "consola"
import { handleError } from "../actions/error"

/*
 * Description:
 * This command initializes the selfmail project to selfhost it.
 */
export const init = new Command()
    .name("init")
    .description("download the selfmail repository and install dependencies")
    // TODO: add options
    // .option("-y, --yes", "skip confirmation prompt.", false)
    .action(async (opts) => {
        try {
            consola.info("cloning selfmail repository...")
            execSync("git clone https://github.com/selfmail/selfmail.git")
            consola.info("installing dependencies...")
            execSync("cd selfmail && pnpm install")
        } catch (error) {
            handleError(error)
        }
    })
