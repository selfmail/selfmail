"use client"

import { cn } from "@/lib/cn";
import { AtSign, BarChart, Circle, Compass, Home, HomeIcon, Mail, Music, Pen, Plus, School, Search, SidebarClose, SidebarOpen, User2, Users2 } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Input } from "ui";
import { create } from "zustand";
import type { SidebarLink as TypeSidebarLink } from "./types";

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
  page: string;
}
type PageAction = {
  setPage: (state: PageState["page"]) => void;
}

export const usePageStore = create<PageState & PageAction>((set) => ({
  page: "index",
  setPage: (state) => set(() => ({ page: state })),
}))

const SidebarLink: React.FC<React.HTMLAttributes<HTMLAnchorElement> & { href: string, page: string }> = ({ href, children, page, ...props }) => {
  const pathname = usePathname()

  // get the second part of the pathname 
  const path = pathname?.split('/')[2] || ''
  return (
    <Link  {...props} href={href} className={cn("flex px-2 py-1 rounded-lg hover:bg-white/60 items-center gap-2 cursor-pointer text-base text-foreground", page === path ? "bg-white/80" : "", props.className)}>
      {children}
    </Link>
  )
}

type address = {
  addressId: string;
  email: string;
}[]

export default function Sidebar({
  children,
  getSidebarLinks,
  getTeams
}: Readonly<{ children: React.ReactNode }> & {
  getSidebarLinks: (team: string) => Promise<TypeSidebarLink[]>,
  getTeams: (team: string) => Promise<any>
}) {
  const { page, setPage } = usePageStore()
  const [links, setLinks] = useState<TypeSidebarLink[]>([]);
  const { isOpen, toggleSidebar } = useSidebarStore();
  const { team } = useParams() as { team: string } // get the team from the url /[team]/etc

  // load the sidebar state from the local storage
  useEffect(() => {
    if (localStorage.getItem("sidebar-open") === "false") toggleSidebar()
  }, [toggleSidebar])

  // set the sidebar state in the local storage
  useEffect(() => {
    localStorage.setItem("sidebar-open", JSON.stringify(isOpen))
  }, [isOpen])

  useEffect(() => {
    const fetchLinks = async () => {
      const data = await getSidebarLinks(team);
      setLinks(data);
    };

    if (team) {
      fetchLinks();
    }
  }, [team, getSidebarLinks])

  const teams = useMemo(async () => await getTeams(team), [getTeams])

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
              <div className="cursor-pointer ring-2 ring-[#bcbcbc]/70 rounded-md flex items-center justify-center w-full border border-border aspect-square">
                <HomeIcon className="h-4 w-4 text-foreground " />
              </div>
              <div className="cursor-pointer rounded-lg bg-background-primary border border-border flex items-center justify-center w-full aspect-square">
                <User2 className="h-4 w-4 text-primary" />
              </div>
              <hr className="border-border" />
              <div className="cursor-pointer rounded-lg bg-background-primary border border-border flex items-center justify-center w-full aspect-square">
                <School className="h-4 w-4 text-blue-700/70" />
              </div>
              <div className="cursor-pointer rounded-lg bg-background-primary border border-border flex items-center justify-center w-full aspect-square">
                <Compass className="h-5 w-5 text-yellow-700" />
              </div>
              <div className="cursor-pointer bg-background-primary rounded-lg border border-border flex items-center justify-center w-full aspect-square">
                <Music className="h-4 w-4 text-green-700/70" />
              </div>
            </div>
            <Link href="/create-team" className="rounded-lg flex items-center border border-border justify-center w-full aspect-square">
              <Plus className="h-4 w-4 text-orange-700" />
            </Link>
          </div>
        </div>
        {/* Sidebar for links */}
        <div className={cn("flex flex-col justify-between px-3 py-2 h-full w-full", isOpen ? "flex" : "hidden")}>
          <div className="w-full space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center rounded-full bg-green-500">
                  <Circle className="h-4 w-4 text-green-700" />
                </div>
                <h2 className="text-lg font-medium">Personal Space</h2>
              </div>
              <div>
                <SidebarClose className="h-4 w-4 text-foreground cursor-pointer" onClick={() => toggleSidebar()} />
              </div>
            </div>
            <Input type="text" placeholder={<div className="flex gap-2 items-center"><Search className="text-foreground h-4 w-4" />Search...</div>} className="w-full" />
            <SidebarLink page="" href={`/${team}/`}><Home className="h-4 w-4 text-cyan-700" />Home</SidebarLink>
            <SidebarLink page="members" href={`/${team}/members`}><Users2 className="h-4 w-4 text-yellow-700" />Members</SidebarLink>
            <SidebarLink page="send" href={`/${team}/send`}><Mail className="h-4 w-4 text-blue-700" />Compose</SidebarLink>
            <SidebarLink page="analytics" href={`/${team}/analytics`}><BarChart className="h-4 w-4 text-orange-700" />Analytics</SidebarLink>
            <SidebarLink page="settings" href={`/${team}/settings`}><Pen className="h-4 w-4 text-green-700" />Settings</SidebarLink>
            <div className="flex items-center space-x-1">
              <p className="text-foreground text-sm">
                Your adresses
              </p>
              <hr />
            </div>
            <SidebarLink page="home" href={`/${team}/jsdkjfdsj`}><AtSign className="h-4 w-4 text-red-700" />henri@selfmail.app</SidebarLink>
          </div>
          <div className="flex items-center w-full space-x-2">
            <Link href={`/${team}/new`} className="flex px-2 py-1 w-full rounded-lg hover:bg-white/70 items-center gap-2 cursor-pointer text-base text-foreground">
              <Plus className="h-4 w-4 text-cyan-700" />
              New Project
            </Link>
          </div>
        </div>
      </div>
      <div className="overflow-y-auto w-full bg-background">
        {children}
      </div>
    </div>
  )
}