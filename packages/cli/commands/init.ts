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

    consola.info("Checking if the required packages are installed... (git, nodejs, npm, pnpm)")

    // git
    await asyncExec('git --version').catch((err) => { if (err) handleError("Git is not installed or throw an error.") });

    // nodejs
    await asyncExec('node --version').catch((err) => { if (err) handleError("Nodejs is not installed or throw an error.") });

    // npm
    await asyncExec('npm --version').catch((err) => { if (err) handleError("Npm is not installed or throw an error.") });

    // pnpm
    await asyncExec('pnpm --version').catch((err) => { if (err) handleError("Pnpm is not installed or throw an error.") });
    // success message
    consola.success("All required packages are installed.")
    space()

    // loading the packages
    const spinner = ora("Cloning the repository...").start()

    // clone the repository
    await asyncExec(`git clone https://github.com/selfmail/selfmail.git ${new String(dir)}`).catch((err) => { if (err) handleError("We were unable to clone the repository.") });
    space()

    // installing the packages
    spinner.text = "Installing the packages..."
    await asyncExec(`cd ${new String(dir)} && pnpm install`).catch((err) => { if (err) handleError("We were unable to install the packages with pnpm.") });

    spinner.text = "Setting up the configuration file..."
    await write(fileContent.config.name, await getContent(fileContent.config.content, {}))

    spinner.text = "Creating the .env file..."

    //TODO: create the .env file


    consola.info("Please fill the .env file with the required information.")

    spinner.stop()
}

type Content = string | ((config?: { [key: string]: string }) => string | Promise<string>);


// object to store the content for the files which are going to be created
const fileContent: {
    [key: string]: {
        name: string,
        content: Content
    }
} = {
    config: {
        name: "selfmail.config.ts",
        content: `
import type { Config } from "@selfmail/config"

export const config: Config = {
    dir: "",
    name: "",
    domain: "localhost:3000",
    port: "3000",
    email: "selfmail@localhost",
    password: "selfmail",
}
        `,
    }
}

async function getContent(path: Content, config?: { [key: string]: string }): Promise<string> {
    if (typeof path === 'string') {
        return path;
    } else if (typeof path === "function") {
        const result = path(config);
        if (result instanceof Promise) {
            return await result;
        }
        return result;
    }
    return handleError("Invalid content type");
}
