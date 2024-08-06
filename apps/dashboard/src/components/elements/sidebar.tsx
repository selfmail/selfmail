"use client";

import {
  BarChart,
  ChevronsUpDown,
  Contact,
  HandCoins,
  HelpCircle,
  Home,
  Inbox,
  Keyboard,
  Mail,
  Mailbox,
  Plane,
  Search,
  Settings,
  Trash,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { KBD } from "ui";
import { useCommandStore } from "./command";

export default function Sidebar({
  adresses,
}: {
  adresses: { email: string }[];
}) {
  const { setOpen } = useCommandStore();
  return (
    <div className="fixed bottom-0 left-0 top-0 hidden min-h-screen flex-col justify-between overflow-auto border-r-2 border-r-[#dddddddd] lg:flex lg:w-[200px] xl:w-[250px]">
      <div className="space-y-3">
        {/* The account switch */}
        <div className="mx-3 mt-3 flex items-center justify-between rounded-xl border-2 border-[#cccccccc] bg-[#f4f4f4] p-2">
          <User className="h-4 w-4" />
          <p>henri</p>
          <ChevronsUpDown className="h-4 w-4" />
        </div>
        <div className="mx-3 flex flex-col" onClick={() => setOpen(true)}>
          <div className="flex cursor-pointer items-center justify-between rounded-xl p-2 hover:bg-[#f4f4f4]">
            <div className="flex">
              <Search className="mr-3 h-4 w-4" />
              <span className="text-sm">Search</span>
            </div>
            <KBD>⌘ K</KBD>
          </div>
        </div>
        {/* The platform located links */}
        <div className="mx-3 flex flex-col">
          <div className="flex items-center">
            <span className="text-sm text-[#666666]">Platform</span>
            <hr className="ml-2 w-full border-2 border-[#cccccccc]" />
          </div>
          <Link
            href="/"
            className="flex w-full items-center rounded-xl p-2 hover:bg-[#f4f4f4]"
          >
            <Home className="mr-3 h-4 w-4" />
            <span className="text-sm">Home</span>
          </Link>
          <Link
            href="/send"
            className="flex w-full items-center rounded-xl p-2 hover:bg-[#f4f4f4]"
          >
            <Plane className="mr-3 h-4 w-4" />
            <span className="text-sm">Send</span>
          </Link>
          <Link
            href="/team"
            className="flex w-full items-center rounded-xl p-2 hover:bg-[#f4f4f4]"
          >
            <Users className="mr-3 h-4 w-4" />
            <span className="text-sm">Teams</span>
          </Link>
          <Link
            href="/upgrade"
            className="flex w-full items-center rounded-xl p-2 hover:bg-[#f4f4f4]"
          >
            <HandCoins className="mr-3 h-4 w-4" />
            <span className="text-sm">Upgrade</span>
          </Link>
          <Link
            href="/analytics"
            className="flex w-full items-center rounded-xl p-2 hover:bg-[#f4f4f4]"
          >
            <BarChart className="mr-3 h-4 w-4" />
            <span className="text-sm">Analytics</span>
          </Link>
          <Link
            href="/adresse"
            className="flex w-full items-center rounded-xl p-2 hover:bg-[#f4f4f4]"
          >
            <Mailbox className="mr-3 h-4 w-4" />
            <span className="text-sm">Adresses</span>
          </Link>
          <Link
            href="/settings"
            className="flex w-full items-center rounded-xl p-2 hover:bg-[#f4f4f4]"
          >
            <Settings className="mr-3 h-4 w-4" />
            <span className="text-sm">Settings</span>
          </Link>
        </div>
        <div className="mx-3 flex flex-col">
          <div className="flex items-center">
            <span className="text-sm text-[#666666]">Aliases</span>
            <hr className="ml-2 w-full border-2 border-[#cccccccc]" />
          </div>
          {adresses.map((adresse) => (
            <Link
              key={adresse.email}
              href={`/adresse/${adresse.email}`}
              className="flex w-full items-center rounded-xl p-2 hover:bg-[#f4f4f4]"
            >
              <Inbox className="mr-3 h-4 w-4" />
              <span className="text-sm">{adresse.email}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="mx-3 pb-4">
        <Link
          href="/help"
          className="flex w-full items-center rounded-xl p-1 text-sm"
        >
          <HelpCircle className="mr-3 h-4 w-4" />
          <span>Help center</span>
        </Link>
        <Link
          href="/contact"
          className="mb-1 flex w-full items-center rounded-xl p-1 text-sm"
        >
          <Contact className="mr-3 h-4 w-4" />
          <span>Contact</span>
        </Link>
        <hr className="w-full border-2 border-[#cccccccc]" />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p>free plan </p>
            <span className="ml-2 h-2 w-2 animate-pulse rounded-full bg-[#555555]" />
          </div>
          <span className="ml-4 h-min cursor-pointer rounded-md bg-[#666666] p-1 text-sm text-[#f4f4f4]">
            upgrade
          </span>
        </div>
      </div>
    </div>
  );
}
