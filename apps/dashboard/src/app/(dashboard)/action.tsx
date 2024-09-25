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