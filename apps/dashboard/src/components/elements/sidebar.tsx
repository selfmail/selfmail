"use client"

import { cn } from "@/lib/cn";
import { BadgeDollarSign, BarChart, Compass, Music, Pen, Plus, School, Settings, SidebarClose, SidebarOpen, User2, Users2 } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect } from "react";
import { create } from "zustand";

// store for the sidebar state (open/close)
type State = {
  isOpen: boolean;
}
type Action = {
  toggleSidebar: () => void;
}

export const useSidebarStore = create<State & Action>((set) => ({
  isOpen: true,
  toggleSidebar: () => set((state) => {
    return { isOpen: !state.isOpen }
  }),
}))

// state for the pages of the sidebar
type PageState = {
  page: "user" | "teams";
}
type PageAction = {
  setPage: (state: PageState["page"]) => void;
}

export const usePageStore = create<PageState & PageAction>((set) => ({
  page: "user",
  setPage: (state) => set(() => ({ page: state })),
}))

const SidebarLink: React.FC<React.HTMLAttributes<HTMLAnchorElement> & { href: string, page: string }> = ({ href, children, page, ...props }) => {
  const pathname = usePathname()

  // get the second part of the pathname 
  const path = pathname?.split('/')[2] || ''
  return (
    <Link  {...props} href={href} className={cn("flex px-2 py-1 rounded-lg hover:bg-background-secondary items-center gap-2 cursor-pointer text-base text-foreground", page === path ? "bg-background-" : "", props.className)}>
      {children}
    </Link>
  )
}

function getNameValue(name: name, params: { teamId: string, teamName: string, userName: string }): string {
  // Prüft, ob `name` ein String ist
  if (typeof name === "string") {
    return name;
  }
  // Falls `name` eine Funktion ist, ruft die Funktion auf
  else if (typeof name === "function") {
    return name(params!); // hier `params` sicherstellen, da es notwendig ist für die Funktion
  }
  throw new Error("Invalid type for name");
}

function getHrefValue(name: SidebarHref, params: { teamId: string }): string {
  // Prüft, ob `name` ein String ist
  if (typeof name === "string") {
    return name;
  }
  // Falls `name` eine Funktion ist, ruft die Funktion auf
  else if (typeof name === "function") {
    return name(params!); // hier `params` sicherstellen, da es notwendig ist für die Funktion
  }
  throw new Error("Invalid type for name");
}

export type name = string | ((params: {
  teamId: string,
  teamName: string,
  userName: string
}) => string)

export type SidebarHref = string | ((params: {
  teamId: string
}) => string)

// sidebar types
export type SidebarLink = {
  name: name,
  href: SidebarHref,
  icon: any
}

export type SidebarGroup = {
  name: name,
  links: SidebarLink[]
}

export type SidebarPage = {
  name: name,
  icon?: any,
  groups?: SidebarGroup[]
}


// links of the Sidebar (hardcoded)
const links: Record<"user" | "teams", SidebarPage> = {
  teams: {
    name: (params) => {
      return `${params.teamName}`
    },
    groups: [
      {
        name: "Informations",
        links: [
          {
            name: "Members",
            href: (params) => `/${params.teamId}/members`,
            icon: Users2,
          },
          {
            name: "Settings",
            href: (params) => `/${params.teamId}/settings`,
            icon: Settings
          },
          {
            name: "Analytics",
            href: (params) => `/${params.teamId}/analytics`,
            icon: BarChart
          },
        ]
      }
    ]
  },
  user: {
    name: `Personal`,
    icon: User2,
    groups: [
      {
        name: "Platform",
        links: [
          {
            name: "Changelog",
            href: "/platform/changelog",
            icon: Pen
          },
          {
            name: "Billing",
            href: "/platform/billing",
            icon: BadgeDollarSign
          },
          {
            name: "Settings",
            href: "/platform/settings",
            icon: Settings
          }
        ]
      },
      {
        name: "Account",
        links: [
          {
            name: "Profile",
            href: "/account/profile",
            icon: User2
          },
          {
            name: "Analytics",
            href: "/account/analytics",
            icon: BarChart
          }
        ]
      },
      {
        name: "Teams",
        links: [
          {
            name: "Teams",
            href: "/user/teams/",
            icon: Users2
          },
          {
            name: "Create new team",
            href: "/user/teams/create",
            icon: Plus
          }
        ]
      }
    ]
  }
}

const teams: {
  slug: string,
  icon: any,
}[] = [
    {
      slug: "team-1",
      icon: School
    },
    {
      slug: "team-2",
      icon: Compass
    },
    {
      slug: "team-3",
      icon: Music
    }
  ]

export default function Sidebar({
  children,
  team,
  username,
}: Readonly<{ children: React.ReactNode }> & {
  team: string | undefined,
  username: string,
}) {
  // get the sidebar state from the local storage
  const { isOpen, toggleSidebar } = useSidebarStore();

  const { page, setPage } = usePageStore()

  const teamId = useParams() as { team: string } | undefined
  const path = usePathname()
  console.log(path)

  useEffect(() => {
    if (teamId) {
      setPage("teams")
    } else {
      setPage("user")
    }
    console.log(teamId)
  }, [teamId])

  const teamName = getNameValue(links[page].name, {
    teamId: teamId?.team, userName: username, teamName: team || username
  })

  const storage = {
    usedStorage: 6,
    usedStoragePercentage: 70,
    totalStorage: 15,
  }

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar for teams */}
      <div className={cn("bg-background h-full  md:flex border-r border-r-border  transition duration-100", isOpen ? " md:w-[225px] lg:w-[300px] xl:w-[350px]" : "w-[60px]")}>
        <div className="flex flex-col items-center justify-between">
          {/* team list */}
          <div className="flex flex-col items-center justify-between h-full border-r border-r-border w-[60px] px-2 py-2">
            <div className="w-full flex flex-col space-y-2">
              {
                !isOpen && (
                  <div className="flex items-center justify-center w-full">
                    <SidebarOpen className="h-4 w-4 text-foreground cursor-pointer" onClick={() => toggleSidebar()} />
                  </div>
                )
              }
              <Link href={"/"} onClick={() => setPage("user")} className={cn("cursor-pointer rounded-xl bg-background-primary border border-border flex items-center justify-center w-full aspect-square transition", (path === ("/" || undefined)) && "ring-2 ring-[#bcbcbc]/70 ring-offset-2 scale-90")}>
                <User2 className="h-4 w-4 text-foreground " />
              </Link>
              <hr className="border-border" />
              {
                teams.map((team) => (
                  <Link href={`/${team.slug}`} key={team.slug} onClick={() => {
                    setPage("teams")
                  }} className={cn("cursor-pointer rounded-xl bg-background-primary border border-border flex items-center justify-center w-full aspect-square transition", team.slug === teamId?.team && "ring-2 ring-[#bcbcbc]/70 ring-offset-2 scale-90")}>
                    <team.icon className="h-4 w-4" />
                  </Link>
                ))
              }
            </div>
            <Link href="/create-team" className="rounded-xl flex items-center border border-border justify-center w-full aspect-square">
              <Plus className="h-4 w-4 text-orange-700" />
            </Link>
          </div>
        </div>
        {/* Sidebar for links */}
        <div className={cn("flex flex-col justify-between px-3 py-2 h-full w-full", isOpen ? "flex" : "hidden")}>
          <div>
            <div className="space-y-1 px-2 mb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-medium">{
                    teamName
                  }</h2>
                </div>
                <div>
                  <SidebarClose className="h-4 w-4 text-foreground cursor-pointer" onClick={() => toggleSidebar()} />
                </div>
              </div>
            </div>
            <div className="w-full space-y-4">
              {
                links[page].groups?.map((group) => (
                  <div className="flex flex-col space-y-1" key={getNameValue(group.name, {
                    teamId: teamId.team,
                    teamName,
                    userName: username
                  })}>
                    <p className="mx-2 text-foreground text-sm">{getNameValue(group.name, {
                      teamId: teamId.team,
                      teamName,
                      userName: username
                    })}</p>
                    {
                      group.links.map((link) => (
                        <SidebarLink page="" href={
                          getHrefValue(link.href, {
                            teamId: teamId.team
                          })
                        }>
                          <link.icon className="h-4 w-4" />
                          {getNameValue(link.name, {
                            teamId: teamId.team,
                            teamName,
                            userName: username
                          })}
                        </SidebarLink>
                      ))
                    }
                  </div>
                ))
              }
            </div>
          </div>
          <div className="space-y-1">
            <div className="bg-background-secondary rounded-xl p-4">
              <h3 className="text-sm font-medium mb-2">Storage</h3>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{storage.usedStorage} / {storage.totalStorage}</span>
                <span className="text-sm text-foreground/70">{storage.usedStoragePercentage}%</span>
              </div>
              <div className="mt-2 h-2 bg-background-primary rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#d5cdfe]"
                  style={{ width: `${storage.usedStoragePercentage}%` }}
                />
              </div>
            </div>

            <Link href={`/${team}/new`} className="flex px-2 py-1 w-full rounded-lg hover:bg-white/70 items-center gap-2 cursor-pointer text-base text-foreground">
              <Plus className="h-4 w-4 text-cyan-700" />
              New Project
            </Link>
          </div>
        </div>
      </div>
      <div className="overflow-y-auto w-full bg-background-primary">
        {children}
      </div>
    </div>
  )
}