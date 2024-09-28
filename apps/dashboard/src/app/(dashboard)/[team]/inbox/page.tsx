import { checkRequest } from "@/server/checkRequest";
import { db } from "database";
import { getEmail } from "./action";
import Content from "./content";


import { getSingleEmail } from "./action";
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
        <Content counter={emailcount} getSingleEmail={getSingleEmail} action={getEmail} />
    );
}
