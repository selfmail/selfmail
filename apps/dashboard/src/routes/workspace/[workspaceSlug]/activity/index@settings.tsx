import {
  $,
  component$,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { server$, z } from "@builder.io/qwik-city";
import { db } from "database";
import BackHeading from "~/components/ui/BackHeading";
import {
  middlewareAuthentication,
  verifyWorkspaceMembership,
} from "~/lib/auth";
import type { MemberInSharedMap } from "../types";

const activity = server$(async function (from: number) {
  const parse = await z
    .object({
      from: z.number().min(0).default(0),
    })
    .safeParseAsync({ from });

  if (!parse.success) {
    throw new Error("Invalid parameters");
  }

  let currentMember = this.sharedMap.get("member") as MemberInSharedMap;
  const workspaceSlug: string = this.params.workspaceSlug;
  if (!currentMember) {
    const sessionToken = this.cookie.get("selfmail-session-token")?.value;

    if (!(workspaceSlug && sessionToken)) {
      throw Error("No workspace slug or session token provided.");
    }

    const { authenticated, user } =
      await middlewareAuthentication(sessionToken);

    if (!(authenticated && user)) {
      throw Error("User is not authenticated. Please log in.");
    }

    const { isMember, member, workspace } = await verifyWorkspaceMembership(
      user.id,
      workspaceSlug
    );

    if (!(isMember && member && workspace)) {
      throw Error("User is not a member of this workspace. Access denied.");
    }
    currentMember = member;
  }

  if (!workspaceSlug) {
    throw new Error("Workspace slug is missing.");
  }

  const activity = await db.activity.findMany({
    where: {
      workspace: {
        slug: workspaceSlug,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: parse.data.from,
    take: 20,
  });

  return activity;
});

export default component$(() => {
  // Store for managing state
  const store = useStore({
    activities: [] as Array<{
      id: string;
      title: string;
      description: string | null;
      color: "neutral" | "positive" | "negative";
      type: "task" | "note" | "event" | "reminder";
      workspaceId: string;
      userId: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>,
    loading: false,
    hasMore: true,
    offset: 0,
  });

  // Signal for the intersection observer target
  const sentinelRef = useSignal<HTMLDivElement>();

  // Load activities when component mounts or when more data is needed
  const loadActivities = $(async (reset = false) => {
    if (store.loading || !(store.hasMore || reset)) return;

    store.loading = true;

    try {
      const offset = reset ? 0 : store.offset;
      const newActivities = await activity(offset);

      if (reset) {
        store.activities = newActivities;
        store.offset = newActivities.length;
      } else {
        store.activities = [...store.activities, ...newActivities];
        store.offset += newActivities.length;
      }

      // If we got less than 20 items, we've reached the end
      store.hasMore = newActivities.length === 20;
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      store.loading = false;
    }
  });

  // Setup intersection observer
  useVisibleTask$(() => {
    if (!sentinelRef.value) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !store.loading && store.hasMore) {
          loadActivities();
        }
      },
      {
        rootMargin: "100px", // Load more items when sentinel is 100px away from view
        threshold: 0.1,
      }
    );

    observer.observe(sentinelRef.value);

    // Initial load
    if (store.activities.length === 0) {
      loadActivities(true);
    }

    return () => {
      observer.disconnect();
    };
  });

  return (
    <>
      <div class="flex flex-col space-y-1">
        <BackHeading>Workspace Activities</BackHeading>
        <p class="text-neutral-500">
          Here you can view recent activities within your workspace.
        </p>
      </div>
      <div class="flex w-full flex-col rounded-xl border border-neutral-200 bg-white p-2">
        <div class="flex flex-col space-y-4">
          {store.activities.length === 0 && !store.loading && (
            <div class="py-4 text-center text-neutral-500">
              No recent activities found.
            </div>
          )}

          {store.activities.map((activityItem, index) => (
            <div
              class="flex flex-col rounded-lg border border-neutral-100 bg-neutral-50 p-4"
              key={`${activityItem.id}-${index}`}
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="font-medium text-neutral-900">
                    {activityItem.title}
                  </p>
                  <p class="mt-1 text-neutral-600 text-sm">
                    {activityItem.description || "No description available"}
                  </p>
                </div>
                <span class="text-neutral-400 text-xs">
                  {new Date(activityItem.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {store.loading && (
            <div class="py-4 text-center">
              <div class="inline-flex items-center space-x-2">
                <div class="h-4 w-4 animate-spin rounded-full border-blue-600 border-b-2" />
                <span class="text-neutral-500">Loading more activities...</span>
              </div>
            </div>
          )}

          {/* Intersection observer sentinel */}
          {store.hasMore && (
            <div
              class="h-4 w-full"
              ref={sentinelRef}
              style={{ minHeight: "1px" }}
            />
          )}

          {/* End of list indicator */}
          {!store.hasMore && store.activities.length > 0 && (
            <div class="py-4 text-center text-neutral-500 text-sm">
              You've reached the end of the activity list
            </div>
          )}
        </div>
      </div>
    </>
  );
});
