import { checkRequest } from "@/server/checkRequest";
import { db } from "database";

export async function DeleteMail(id: string): Promise<void | string> {
  "use server";

  // TODO implement function to delete an email secured
  const req = await checkRequest();
  try {
    const mail = await db.email.delete({
      where: {
        id,
        userId: req.userId,
      },
    });
  } catch (e) {
    return e as string;
  }
}
