import DataTable, { email } from "@/components/elements/table";
import { getUser } from "@/lib/auth";
import { db } from "database";
/**
 * The inbox page, here are all of your mails.
 * @returns {Promise<JSX.Element>}
 */
export default async function Inbox({
    params: { team }
}: {
    params: {
        team: string
    }
}): Promise<JSX.Element> {

    const user = await getUser()



    const emailcount = await db.email.count({
        where: {
            userId: user.id,
        },
    });

    return (
        <main className="flex">
            <div className="flex pt-3 flex-col lg:w-[50%] border-r border-r-border h-full min-h-screen overflow-y-auto">
                <DataTable
                    counter={emailcount}
                    action={async ({ from, list }: { from: number, list: number }) => {
                        "use server"
                        const emails = await db.email.findMany({
                            where: {
                                userId: user.id,
                            },
                            select: {
                                id: true,
                                createdAt: true,

                            },
                            take: list,
                            skip: from,
                        }) as email[]
                        return emails
                    }}
                />
            </div>
            <div className="w-[50%] h-screen flex items-center justify-center overflow-y-auto">
                <h2 className="text-foreground-secondary text-3xl font-medium">No Email selected</h2>
            </div>
        </main>
    );
}
