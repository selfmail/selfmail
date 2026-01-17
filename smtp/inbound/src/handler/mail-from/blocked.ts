import { db } from "database";
import { extractDomain } from "./domain";

export async function blocked(email: string): Promise<boolean> {
  const domain = extractDomain(email);

  const blocked = await db.blocked.findFirst({
    where: {
      domain,
      email,
    },
  });
  return !!blocked;
}
