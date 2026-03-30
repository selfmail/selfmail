import { $, component$, useOnDocument, useSignal } from "@builder.io/qwik";
import { Link, useNavigate } from "@builder.io/qwik-city";
import {
	LuCheck,
	LuChevronsUpDown,
	LuLogOut,
	LuPlus,
	LuSettings,
} from "@qwikest/icons/lucide";

type Workspace = {
	id: string;
	slug: string;
	name: string;
	image: string | null;
};

type OrgSwitcherProps = {
	currentWorkspace: {
		id: string;
		name: string;
		image: string | null;
	};
	workspaces: Workspace[];
};

export const OrgSwitcher = component$<OrgSwitcherProps>(
  ({ currentWorkspace, workspaces }) => {
    const isOpen = useSignal(false);
    const nav = useNavigate();

    const togglePopover = $(() => {
      isOpen.value = !isOpen.value;
    });

    const closePopover = $(() => {
      isOpen.value = false;
    });

    const handleWorkspaceSwitch = $(async (slug: string) => {
      closePopover();
      await nav(`/workspace/${slug}`);
    });

    useOnDocument(
      "click",
      $((event) => {
        const target = event.target as HTMLElement;
        const popover = document.getElementById("org-switcher-popover");
        const trigger = document.querySelector(
          '[popovertarget="org-switcher-popover"]'
        );

        if (
          isOpen.value &&
          popover &&
          trigger &&
          !popover.contains(target) &&
          !trigger.contains(target)
        ) {
          closePopover();
        }
      })
    );

    return (
      <div class="relative">
        <button
          class="flex cursor-pointer flex-row items-center space-x-3 rounded-lg pr-1 transition hover:bg-neutral-200 hover:ring-4 hover:ring-neutral-200"
          onClick$={togglePopover}
          popovertarget="org-switcher-popover"
          type="button"
        >
          {currentWorkspace.image ? (
            <img
              alt={currentWorkspace.name}
              class="h-7 w-7 rounded-lg object-cover"
              height={40}
              src={currentWorkspace.image}
              width={40}
            />
          ) : (
            <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-600 font-medium text-lg text-white">
              {currentWorkspace.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h3 class="font-medium text-lg">{currentWorkspace.name}</h3>
          <LuChevronsUpDown class="h-4 w-4 text-neutral-500" />
        </button>

        {isOpen.value && (
          <div
            class="absolute top-full left-0 z-50 mt-2 w-64 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg"
            id="org-switcher-popover"
          >
            <div class="mb-2 px-2 py-1.5 text-neutral-500 text-xs">
              Switch workspace
            </div>
            <div class="flex flex-col gap-1">
              {workspaces.map((workspace) => (
                <button
                  class={`flex w-full flex-row items-center justify-between rounded-md px-2 py-2 text-left transition hover:bg-neutral-100 ${
                    workspace.id === currentWorkspace.id ? "bg-neutral-50" : ""
                  } cursor-pointer`}
                  key={workspace.id}
                  onClick$={() => handleWorkspaceSwitch(workspace.slug)}
                  type="button"
                >
                  <div class="flex flex-row items-center space-x-3">
                    {workspace.image ? (
                      <img
                        alt={workspace.name}
                        class="h-6 w-6 rounded-md object-cover"
                        height={24}
                        src={workspace.image}
                        width={24}
                      />
                    ) : (
                      <div class="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-600 text-white text-xs">
                        {workspace.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span class="text-sm">{workspace.name}</span>
                  </div>
                  {workspace.id === currentWorkspace.id && (
                    <LuCheck class="h-4 w-4 text-neutral-600" />
                  )}
                </button>
              ))}
            </div>
            <div class="mt-2 border-neutral-200 border-t pt-2">
              <Link
                class="flex w-full cursor-pointer flex-row items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition hover:bg-neutral-100"
                href="/account"
                onClick$={closePopover}
              >
                <LuSettings class="h-4 w-4 text-neutral-500" />
                Account Settings
              </Link>
              <button
                class="flex w-full cursor-pointer flex-row items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition hover:bg-neutral-100"
                onClick$={async () => {
                  closePopover();
                  await nav("/auth/logout");
                }}
                type="button"
              >
                <LuLogOut class="h-4 w-4 text-neutral-500" />
                Logout
              </button>
            </div>
            <div class="mt-2 border-neutral-200 border-t pt-2">
              <Link
                class="flex w-full cursor-pointer flex-row items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition hover:bg-neutral-100"
                href="/create"
                onClick$={closePopover}
              >
                <LuPlus class="h-4 w-4 text-neutral-500" />
                Create workspace
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }
);
