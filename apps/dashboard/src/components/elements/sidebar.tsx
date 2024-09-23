"use client"

import { Compass, Grid, Home, HomeIcon, Music, Pen, Plus, School, User2, Users2 } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { create } from "zustand";
import { cn } from "../../../lib/cn";
// store for the sidebar state (open/close)
type State = {
  isOpen: boolean;
}
type Action = {
  toggleSidebar: () => void;
}

const useSidebarStore = create<State & Action>((set) => ({
  isOpen: true,
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
}))

const SidebarLink: React.FC<React.HTMLAttributes<HTMLAnchorElement> & { href: string, page: string }> = ({ href, children, page, ...props }) => {
  const pathname = usePathname()

  // get the second part of the pathname 
  const path = pathname?.split('/')[2] || ''
  return (
    <Link  {...props} href={href} className={cn("flex px-2 py-1 rounded-lg hover:bg-white/60 items-center gap-2 cursor-pointer text-base text-foreground", page === path ? "bg-white" : "", props.className)}>
      {children}
    </Link>
  )
}

export default function Sidebar({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const { isOpen, toggleSidebar } = useSidebarStore();
  const { team } = useParams() as { team: string } // get the team is from the url /[team]/etc
  return (
    <div className="flex min-h-screen w-full">
      <div className={cn("flex bg-background-secondary h-full xl:w-[350px] transition duration-100", isOpen ? "xl:w-[350px]" : "xl:w-[0px]")}>
        <div className="flex flex-col items-center justify-between">
          {/* team list */}
          <div className="flex flex-col items-center justify-between h-full border-r border-r-border min-w-[60px] px-2 py-2">
            <div className="w-full flex flex-col space-y-2">
              <div className="cursor-pointer rounded-md flex items-center justify-center w-full aspect-square">
                <HomeIcon className="h-4 w-4 text-foreground" />
              </div>
              <div className="cursor-pointer rounded-lg bg-background-primary border border-border flex items-center justify-center w-full aspect-square">
                <User2 className="h-4 w-4 text-black/70" />
              </div>
              <hr />
              <div className="cursor-pointer rounded-lg bg-background-primary border-border flex items-center justify-center w-full aspect-square">
                <School className="h-4 w-4 text-blue-700/70" />
              </div>
              <div className="cursor-pointer rounded-lg bg-background-primary border-border flex items-center justify-center w-full aspect-square">
                <Compass className="h-5 w-5 text-yellow-700/70" />
              </div>
              <div className="cursor-pointer bg-background-primary rounded-lg border-border flex items-center justify-center w-full aspect-square">
                <Music className="h-4 w-4 text-green-700/70" />
              </div>
            </div>
            <div className="rounded-lg border-border flex items-center justify-center w-full aspect-square">
              New Project
            </div>
          </div>
        </div>
        {/* Sidebar for teams */}
        <div className={cn("flex flex-col justify-between px-3 py-2 h-full", isOpen ? "flex" : "hidden")}>
          <div className="w-full  space-y-2">
            {/* <Input type="text" placeholder={<div className="flex gap-2 items-center"><Search className="text-foreground h-4 w-4" />Search...</div>} className="w-full" /> */}
            <SidebarLink page="" href={`/${team}/`}><Home className="h-4 w-4 text-cyan-700" />Home</SidebarLink>
            <SidebarLink page="team" href={`/${team}/team`}><Users2 className="h-4 w-4 text-yellow-700" />Members</SidebarLink>
            <SidebarLink page="projects" href={`/${team}/team`}><Grid className="h-4 w-4 text-blue-700" />Projects</SidebarLink>
            <SidebarLink page="settings" href={`/${team}/team`}><Pen className="h-4 w-4 text-green-700" />Settings</SidebarLink>
            <div className="flex items-center space-x-1">
              <p className="text-foreground text-sm">
                Projects
              </p>
              <hr />
            </div>
            <SidebarLink page="home" href={`/${team}/jsdkjfdsj`}><HomeIcon className="h-4 w-4 text-red-700" />Geschichte</SidebarLink>
          </div>
          <div className="flex items-center w-full space-x-2">
            <Link href={`/${team}/new`} className="flex px-2 py-1 w-full rounded-lg hover:bg-white/70 items-center gap-2 cursor-pointer text-base text-foreground">
              <Plus className="h-4 w-4 text-orange-700" />
              New Project
            </Link>
          </div>
        </div>
      </div>
      <div>
        {children}
      </div>
    </div>
  )
}