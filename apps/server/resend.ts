import { Resend } from "resend";
import { config } from "./config";

/**
 * The resend instance
 */
export const resend = new Resend(config.RESEND);
