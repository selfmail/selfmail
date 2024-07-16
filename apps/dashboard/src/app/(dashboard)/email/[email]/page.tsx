import { db } from "database";

export default async function Email({
    params
}: {
    params: {
        email: string;
    }
}) {
    const email = await db.email.findUnique({
        where: {
            id: params.email
        }
    })
    console.log(email)
    return (
        <div>Email</div>
    )
}