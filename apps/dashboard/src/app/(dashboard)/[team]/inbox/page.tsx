import { checkRequest } from "@/server/checkRequest";
import { db } from "database";
import { getEmail } from "./action";
import Content from "./content";


import { getSingleEmail } from "./action";
import type { JSX } from "react";
/**
 * The inbox page, here are all of your mails.
 * @returns {Promise<JSX.Element>}
 */
export default async function Inbox(
    props: {
        searchParams?: Promise<{
            [key: string]: string | string[] | undefined;
        }>;
        params: Promise<{
            team: string
        }>
    }
): Promise<JSX.Element> {
    const params = await props.params;

    const {
        team
    } = params;

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
