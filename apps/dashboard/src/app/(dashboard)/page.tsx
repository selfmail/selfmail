import DataTable from "@/components/elements/table";
import { checkRequest } from "@/server/checkRequest";
import { db } from "database";

/**
 * The inbox page, here are all of your mails.
 * @returns {Promise<JSX.Element>}
 */
export default async function Inbox(): Promise<JSX.Element> {
  const user = await checkRequest()
  const userDb = await db.user.findUnique({
    where: {
      id: user.id
    }
  })
  const emails = await db.email.findMany({
    where: {
      userId: userDb?.id
    }
  })
  console.log(emails)
  return (
    <main className="min-h-screen bg-[#e8e8e8]">
      <div className="mt-3 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center ml-2">
            <input type="checkbox" className="h-4 w-4 mr-3" />
            <h2 className="text-3xl font-medium mx-3 ">Your Inbox</h2>
          </div>
          <p>accounts</p>
        </div>
        <DataTable data={emails} />
        <div className="border-t-2 border-[#cccccc]" />
      </div>
    </main>
  );
}
