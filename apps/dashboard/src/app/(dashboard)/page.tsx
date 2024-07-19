import DataTable from "@/components/elements/table";
import { checkRequest } from "@/server/checkRequest";
import { db } from "database";
import { redirect } from "next/navigation";

/**
 * The inbox page, here are all of your mails.
 * @returns {Promise<JSX.Element>}
 */
export default async function Inbox(): Promise<JSX.Element> {
  const req = await checkRequest()
  const user = await db.user.findUnique({
    where: {
      id: req.userId
    }
  })
  if (!user) redirect(`/login`)
  const emails = await db.email.findMany({
    where: {
      userId: user.id
    }
  })
  return (
    <main className="min-h-screen bg-[#e8e8e8]">
      <div className="mt-3 flex flex-col">
        <DataTable data={emails} />
      </div>
    </main>
  );
}
