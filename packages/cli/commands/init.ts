import { text } from "@clack/prompts"
import { exec } from "child_process"
import consola from "consola"
import ora from "ora"
import util from "util"
import { handleError } from "../actions/error"
import { link } from "../actions/link"
import { space } from "../actions/space"
import { write } from "../actions/write"

const asyncExec = util.promisify(exec)

export const init = async () => {
    consola.info(`Initializing your ${link("selfmail", "https://selfmail.app")} project...`)

    const dir = await text({
        message: "How should we name your folder?",
        placeholder: "selfmail",
    })

    // check if the required packages are installed

    // git
    await asyncExec('git --version').catch((err) => { if (err) handleError("Git is not installed or throw an error.") });

    // nodejs
    await asyncExec('node --version').catch((err) => { if (err) handleError("Nodejs is not installed or throw an error.") });

    // npm
    await asyncExec('npm --version').catch((err) => { if (err) handleError("Npm is not installed or throw an error.") });

    // pnpm
    await asyncExec('pnpm --version').catch((err) => { if (err) handleError("Pnpm is not installed or throw an error.") });
    consola.success("All required packages are installed.")
    space()

    const spinner = ora("Cloning the repository...").start()

    // clone the repository
    // await asyncExec(`git clone https://github.com/selfmail/selfmail.git ${new String(dir)}`).catch((err) => { if (err) handleError("We were unable to clone the repository.") });
    space()


    // installing the packages
    spinner.text = "Installing the packages..."
    // await asyncExec(`cd ${new String(dir)} && pnpm install`).catch((err) => { if (err) handleError("We were unable to install the packages with pnpm.") });

    spinner.text = "Setting up the configuration file..."


    spinner.text = "Creating the .env file..."
    await write(".env", `
# The name of your application
APP_NAME=selfmail
# The domain of your application
APP_DOMAIN=localhost:3000
# The port of your application
APP_PORT=3000
# The email address of your application
APP_EMAIL=selfmail@localhost
# The password of your application
APP_PASSWORD=selfmail
`)

    spinner.stop()




}