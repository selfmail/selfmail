import { checkRequest } from "@/server/checkRequest";
import { db } from "database";
import { z } from "zod";
import { getEmail } from "./action";
import Content from "./content";

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
    const req = await checkRequest();

    const emailcount = await db.email.count({
        where: {
            userId: req.userId,
        },
    });
    return (
        <Content counter={emailcount} action={getEmail} />
    );
}
