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
    params: { team }
}: {
    params: {
        team: string
    }
}): Promise<JSX.Element> {




    // get the emails with the pagniation
    // const emails = await db.email.findMany({
    //     where: {
    //         userId: user.id,
    //     },
    //     select: {
    //         id: true,
    //         createdAt: true,
    //         subject: true,
    //         sender: true,
    //         recipient: true,
    //     },
    //     take: dif,
    //     skip: first,
    // });

    // const emailcount = await db.email.count({
    //     where: {
    //         userId: req.userId,
    //     },
    // });

    return (
        <main className="flex">
            <div className="flex pt-3 flex-col lg:w-[50%] border-r border-r-border h-full min-h-screen overflow-y-auto">
                {/* <DataTable
                    mailCounter={emailcount}
                    pagniation={{ first, last, difference: dif }}
                    data={emails}
                /> */}
            </div>
            <div className="w-[50%] h-screen flex items-center justify-center overflow-y-auto">
                <h2 className="text-foreground-secondary text-3xl font-medium">No Email selected</h2>
            </div>
        </main>
    );
}
