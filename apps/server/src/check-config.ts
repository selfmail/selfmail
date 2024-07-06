import { config } from "../config";

/**
 * This is a function to check if the config is correct.
 * If the config is not correct, the server will not start and an error will be thrown.
 */
export default function CheckConfig() {
  // checking if the resend key is defined
  if (!config.RESEND || config.RESEND === "")
    throw new Error("RESEND Key is not defined");
  if (
    !config.SUPPORT_MAIL ||
    config.SUPPORT_MAIL === ("" as `${string}@${string}.${string}`)
  )
    throw new Error("SUPPORT_MAIL is not defined.");
}
