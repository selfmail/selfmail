// Get information about if the user is in a team

import { auth } from "auth";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ organization: string }> },
) {
    let error = false;
    const authChecks = await Promise.all([
        auth.api.getSession({
            headers: await headers(),
        }),
        async () => {
            console.log("Checking Orgs")
            const org = await auth.api.getFullOrganization({
                headers: await headers(),
            })

            const organization = (await params).organization

            if (org?.slug !== organization) {
                console.log("Orgs not matching")
                throw new Error("Orgs not matching.")
            }
        },
    ]).catch((e) => {
        console.log(e)
        if (e) error = true
    })
    console.log(error)
    if (error) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log("Member defined")
    return NextResponse.json({ isMember: true });
}
