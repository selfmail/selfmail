import { db } from "../../../../packages/database/src"

export default async function NotFound() {
    console.log(await db.user.findFirst())
    return <div>Not Found</div>
}