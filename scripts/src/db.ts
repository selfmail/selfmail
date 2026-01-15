import { db } from "database";

try {
  await db.permission.createMany({
    data: [
      // address permissions
      {
        name: "address:create",
      },

      // manage members permissions
      {
        name: "members:read",
      },
      {
        name: "members:invite",
      },
      {
        name: "members:remove",
      },

      // manage domains permissions
      {
        name: "domains:add",
      },
      {
        name: "domains:delete",
      },
      {
        // for example create a new verification token
        name: "domains:update",
      },

      // activities
      {
        name: "activities:read",
      },
      {
        name: "activities:delete",
      },
      {
        name: "activities:see-all",
      },

      // settings
      {
        name: "settings:update-workspace",
      },
      {
        name: "settings:delete",
      },
    ],
  });
} catch (e) {
  console.error("Permissions seeding failed:", e);
}
