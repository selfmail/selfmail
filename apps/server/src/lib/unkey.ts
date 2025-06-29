import { Unkey } from "@unkey/api";

export const unkey = new Unkey({ rootKey: process.env.UNKEY_ROOT_KEY ?? "" });
