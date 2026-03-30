import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { db } from "database";
import BackHeading from "~/components/ui/BackHeading";

const useStorage = routeLoader$(async ({ sharedMap }) => {
  const member = sharedMap.get("member");
  const workspace = sharedMap.get("workspace");

  if (!workspace?.id) {
    throw new Error("Workspace not found");
  }

  if (!member?.id) {
    throw new Error("Member not found");
  }

  // Get total used storage for the member
  const storage = await db.member.findUnique({
    where: { id: member.id },
    select: {
      storageBytes: true,
    },
  });

  if (!storage) {
    throw new Error("Storage information not found for member");
  }

  return {
    storage,
  };
});

export default component$(() => {
  const storageData = useStorage();
  return (
    <>
      <BackHeading>Storage Usage</BackHeading>
      <div class="flex w-full flex-col space-y-3">
        <p class="px-5">
          You have used{" "}
          {(Number(storageData.value.storage.storageBytes) / 1024 ** 3).toFixed(
            2
          )}{" "}
          GB
        </p>
      </div>
    </>
  );
});
