import { Context } from "effect";

export class DatabaseService extends Context.Service<
  DatabaseService,
  () => void
>()("@selfmail/spam/Database") {}
