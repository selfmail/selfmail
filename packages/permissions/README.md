# permissions

Typesafe workspace permission package for Selfmail.

It encapsulates permission queries against the database and exports three helpers:

- `permissions()` returns the allowed permissions from a requested list.
- `hasPermissions()` checks whether all requested permissions are present.
- `hasAnyPermission()` checks whether at least one permission is present.

```ts
import { hasPermissions } from "@selfmail/permissions";

const canDeleteDomain = await hasPermissions({
  memberId: "member-id",
  permissions: ["domains:delete"],
  workspaceId: "workspace-id",
});
```
