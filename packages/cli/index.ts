import { defineCommand, runMain } from "citty";
import consola from "consola";
import { z } from "zod";
import { space } from "./actions/space";
import { init as initSelfmail } from "./commands/init";
import { remove as removeSelfmail } from "./commands/remove";
import { update as updateSelfmail } from "./commands/update";

const main = defineCommand({
  meta: {
    name: "selfmail",
    version: "0.0.1",
    description: "Selfhost selfmail the easy way...",
  },
  args: {
    init: {
      type: "boolean",
      description: "Init the project for the first time",
      required: false,
    },
    update: {
      type: "boolean",
      description: "Update the project",
      required: false,
    },
    remove: {
      type: "boolean",
      description: "Remove the project",
      required: false,
    }
  },
  async run({ args }) {
    // no args defined, an error will be thrown
    if (!args.init && !args.update && !args.remove) {
      consola.error("Please specify a command to run.")
      consola.info("Usage: selfmail --[init|update|remove]")
      space()
    }
    // parsing the args, only one arg can be defined
    const schema = await z.object({
      remove: z.boolean().optional(),
      init: z.boolean().optional(),
      update: z.boolean().optional()
    }).safeParseAsync(args)

    if (!schema.success) {
      consola.error("Invalid args. You can only run 1 command.")
    }

    // the args
    const remove = schema.data?.remove
    const init = schema.data?.init
    const update = schema.data?.update

    // run the command
    if (remove) {
      await removeSelfmail()
    } else if (init) {
      await initSelfmail()
    } else if (update) {
      await updateSelfmail()
    }

    // success message
    space()
    consola.success("Your command run successfully.")
  }
});
runMain(main)