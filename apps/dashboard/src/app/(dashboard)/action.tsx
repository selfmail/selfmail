import { checkRequest } from "@/server/checkRequest"
import { db } from "database"
import { Home, Users2 } from "lucide-react"
import type { SidebarLink } from "../../components/elements/types"
export async function getSidebarLinks(team: string) {
    "use server"
    const data: SidebarLink[] = [{
        name: "Home",
        href: `/${team}/`,
        icon: <Home className="h-4 w-4 text-cyan-700" />
    }, {
        name: "Members",
        href: `/${team}/members`,
        icon: <Users2 className="h-4 w-4 text-yellow-700" />
    }]
    return data
}
export async function getTeams() {
    "use server"

    const req = await checkRequest()
    const user = await db.user.findUnique({
        where: {
            id: req.userId
        }
    })
    if (!user) {
        throw new Error("User not defined. Please delete your cookies and try to login another time.")
    }
    const teams = await db.team.findMany({
        where: {
            OR: [
                { ownerId: user.id },
                { members: { some: { id: user.id } } },
            ]
        },
        include: {
            owner: true,
            members: true
        }
    })
    return teams
}
export async function getSidebarTeam(teamId: string) {
    // get the sidebar which belongs to the user 
    const addresses = await db.teamAddress.findMany({
        where: {

        }
    })
}