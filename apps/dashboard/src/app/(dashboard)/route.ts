import { redirect } from "next/navigation";

export async function GET(request: Request) {
    // get the last used team
    redirect("/u")
}