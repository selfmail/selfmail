import { defineCommand, runMain } from "citty";
import consola from "consola";

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
  run({ args }) {
    if (!args.init && !args.update && !args.remove) {
      consola.error("Please specify a command to run.")
      consola.info("Usage: selfmail --[init|update|remove]")

      process.exit(1)
    }
  }
});
runMain(main)