import { getSession, IronSessionType } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
    const session = await getSession({
        checkDB: true
    }).catch((e) => {
        return NextResponse.json({
            error: e.message
        })
    }) as IronSessionType

    if (!session.userId) {
        return NextResponse.json({
            error: "You are not logged in."
        })
    }

    return NextResponse.json({
        errror: null
    })
}