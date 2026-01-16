import { RspamdClient } from "spam";

export const rspamd = new RspamdClient({
  host: process.env.RSPAMD_HOST || "localhost",
  port: Number(process.env.RSPAMD_PORT) || 11_334,
  timeout: Number(process.env.RSPAMD_TIMEOUT) || 5000,
});
