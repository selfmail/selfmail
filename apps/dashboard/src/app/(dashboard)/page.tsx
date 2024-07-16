import DataTable from "@/components/elements/table";
import { getGroqChatCompletion } from "@/server/ai";
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
  const chat = await getGroqChatCompletion()
  console.log(chat)
  return (
    <main className="min-h-screen bg-[#e8e8e8]">
      <div className="mt-3 flex flex-col">
        <DataTable data={emails} />
        <div className="border-t-2 border-[#cccccc]" />
      </div>
    </main>
  );
}
