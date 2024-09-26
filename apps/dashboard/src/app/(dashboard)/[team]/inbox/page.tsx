import DataTable from "@/components/elements/table";
import { checkRequest } from "@/server/checkRequest";
import { db } from "database";
import { redirect } from "next/navigation";
import { z } from "zod";

/**
 * This function gets a string and validate, if this is a valid pagniation search param.
 *
 * @param {string} s - the search param to validate
 */
async function checkPagniation(s: string): Promise<
    | {
        first: number;
        last: number;
    }
    | undefined
> {
    const string = s.split("-"); // ["01", "-", "10"]
    const parse = await z
        .object({
            first: z.number(),
            last: z.number(),
        })
        .safeParseAsync({
            first: Number(string[0]),
            last: Number(string[1]),
        });
    if (!parse.success) return undefined;

    return {
        first: parse.data.first,
        last: parse.data.last,
    };
}

/**
 * The inbox page, here are all of your mails.
 * @returns {Promise<JSX.Element>}
 */
export default async function Inbox({
    searchParams,
    params: { team }
}: {
    searchParams?: {
        [key: string]: string | string[] | undefined;
    };
    params: {
        team: string
    }
}): Promise<JSX.Element> {

    // getting the pagniation
    const s = searchParams?.s as string;
    if (!s) redirect(`/${team}/?s=0-10`);

    // checking if the search param is a string an not array or undefined
    const pagniationSchema = await z.string().safeParseAsync(s);
    if (!pagniationSchema.success)
        throw new Error("Seachparams have the wrong format.");

    // validating the numbers in this string
    const numbers = await checkPagniation(s);
    if (!numbers) throw new Error("Pagniation failed.");
    const { first, last } = numbers;
    if (first >= last) throw new Error("First value can't be bigger than the last one.");

    const dif = Math.abs(first - last);

    if (dif > 30) throw new Error("You can see a maximum of 30 emails.");

    // get the user
    const req = await checkRequest();
    const user = await db.user.findUnique({
        where: {
            id: req.userId,
        },
    });
    if (!user) redirect("/login");

    // get the emails with the pagniation
    const emails = await db.email.findMany({
        where: {
            userId: user.id,
        },
        select: {
            id: true,
            createdAt: true,
            subject: true,
            sender: true,
            recipient: true,
        },
        take: dif,
        skip: first,
    });

    const emailcount = await db.email.count({
        where: {
            userId: req.userId,
        },
    });

    return (
        <main className="flex">
            <div className="flex pt-3 flex-col lg:w-[50%] border-r border-r-border h-full min-h-screen overflow-y-auto">
                <DataTable
                    mailCounter={emailcount}
                    pagniation={{ first, last, difference: dif }}
                    data={emails}
                />
            </div>
            <div className="w-[50%] h-screen flex items-center justify-center overflow-y-auto">
                <h2 className="text-foreground-secondary text-3xl font-medium">No Email selected</h2>
            </div>
        </main>
    );
}
