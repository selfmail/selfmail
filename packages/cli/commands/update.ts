import { execSync } from "child_process"
import { Command } from "commander"
import { handleError } from "../actions/error"

/*
 * Description:
 * update you selfmail installation
 */
export const update = new Command()
    .name("update")

    .description("update your selfmail installation")
    // TODO: add options
    // .option("-y, --yes", "skip confirmation prompt.", false)
    .action(async (opts) => {
        try {
            // copy the .env files
            execSync("cp selfmail/.env.example selfmail/.env")
            // removing the current selfmail repository
            execSync("rm -rf selfmail")
            // pulling the new repository

            // installing the dependencies

            // copying the .env file

            // migrating the database
        } catch (error) {
            handleError(error)
        }
    })
