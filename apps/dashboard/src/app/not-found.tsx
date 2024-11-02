import { db } from "database"

export default async function NotFound() {
    console.log(await db.user.findFirst())
    return <div>Not Found</div>
}