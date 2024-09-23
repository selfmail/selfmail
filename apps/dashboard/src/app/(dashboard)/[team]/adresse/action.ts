import { checkRequest } from "@/server/checkRequest";
import { db } from "database";

/**
 * Delete a certain adresse.
 * @param {string} id - the id of the adresse.
 */
export async function DeleteAdresse(id: string) {
  "use server";

  const req = await checkRequest();

  const adresse = await db.adresse.findUnique({
    where: {
      id,
    },
  });

  if (adresse?.userId !== req.userId) {
    throw new Error("Unauthorized.");
  }
  if (adresse.type === "main")
    return "Adresse with type main is not deleteable.";
  const del = await db.adresse.delete({
    where: {
      id: adresse.id,
    },
  });
}
