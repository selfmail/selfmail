"use client";

import { Command } from "cmdk";
import {
  AtSign,
  Inbox,
  Info,
  User2,
  Users
} from "lucide-react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { useHotkeys } from 'react-hotkeys-hook';
import { KBD } from "ui";
import { create } from "zustand";
// Command state
type State = {
  open: boolean;
};
type Action = {
  setOpen: (val: State["open"]) => void;
};
export const useCommandStore = create<State & Action>((set) => ({
  open: false,
  setOpen: (state) => set(() => ({ open: state })),
}));

// types for the arrays below
type ActionArrayWithGroup = Array<{
  title: string;
  group: string;
  key?: string;
  action: (router: AppRouterInstance) => void;
  icon: React.ReactNode;
}>;
type ActionArray = Array<{
  title: string;
  group?: string;
  key?: string;
  action: (router: AppRouterInstance) => void;
  icon: React.ReactNode;
}>;
type ActionWithGroup = {
  title: string;
  group: string;
  key?: string;
  action: (router: AppRouterInstance) => void;
  icon: React.ReactNode;
};

/**
 * Actions of the command menu. All of the actions are a
 * seperate object inside this array.
 */
export const actions: ActionArray = [
  {
    title: "Inbox",
    group: "Mail",
    icon: <Inbox className="h-4 w-4" />,
    action: () => {
      console.log("pressed inbox");
    },
  },
  {
    title: "Adresses",
    group: "Mail",
    icon: <AtSign className="h-4 w-4" />,
    action: (router) => {
      router.push("/adresses");
    },
    key: "Strg 1",
  },
  {
    title: "Teams",
    group: "Platform",
    icon: <Users className="h-4 w-4" />,
    action: () => { },
  },
  {
    title: "Settings",
    group: "Platform",
    icon: <User2 className="h-4 w-4" />,
    action: () => { },
  },
];

const actionsWithGroup = actions.filter((a) => {
  if (a.group) {
    return a;
  }
}) as ActionArrayWithGroup;

// filter the unique groups
const groups: ActionArrayWithGroup = [];
actions.map((action) => {
  if (!action.group) return;
  const group = groups.find((a) => a.group === action.group);
  if (group) return;
  groups.push(action as ActionWithGroup);
});

// a function to get the elements from a specific group
const getActions = (group: string): ActionArrayWithGroup => {
  const values = actions.filter((a) => a.group === group);
  return values as ActionArrayWithGroup;
};

export default function CommandMenu() {
  const { open, setOpen } = useCommandStore();
  const router = useRouter();

  useHotkeys("meta+k", () => setOpen(!open));

  return (
    <>
      {open && (
        <>
          <Command.Dialog
            className="fixed left-[50%] top-[50%] z-30 hidden translate-x-[-50%] translate-y-[-50%] flex-col rounded-xl border bg-white p-2 md:flex lg:w-[500px]"
            onOpenChange={setOpen}
            open={open}
          >
            <Command.Input
              placeholder="Type to search..."
              className="mb-2 rounded-xl border-2 border-[#dddddddd] bg-[#f4f4f4] p-2 focus-visible:border-[#666666] focus-visible:outline-none"
            />
            <Command.Empty className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-red-400" />{" "}
              <p>Command not found.</p>
            </Command.Empty>
            <Command.List>
              {groups.map((group) => (
                <Command.Group
                  key={group.group}
                  className="text-sm text-[#666666]"
                  heading={group.group}
                >
                  {getActions(group.group).map((action) => (
                    <Command.Item
                      contextMenu="hey"
                      onClick={() => {
                        action.action(router);
                        console.log("clicked");
                      }}
                      className="flex cursor-pointer items-center justify-between rounded-xl px-2 py-2 text-base text-black hover:bg-[#e0e0e0] focus-visible:bg-[#e0e0e0]"
                      key={action.title}
                    >
                      <div className="flex items-center space-x-2">
                        {action.icon}
                        <div>{action.title}</div>
                      </div>
                      {action.key && <KBD>{action.key}</KBD>}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command.Dialog>
          <div className="fixed bottom-0 left-0 right-0 top-0 z-20 hidden bg-[#0000004b] md:flex" />
        </>
      )}
    </>
  );
}
