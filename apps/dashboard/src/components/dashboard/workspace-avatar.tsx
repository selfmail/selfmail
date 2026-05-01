import { cn } from "#/lib/utils";
import type { WorkspaceSummary } from "./types";

interface WorkspaceAvatarProps {
  size?: "sm" | "md";
  workspace: WorkspaceSummary;
}

export function WorkspaceAvatar({
  size = "md",
  workspace,
}: WorkspaceAvatarProps) {
  const sizeClass = size === "sm" ? "size-6 rounded-md text-xs" : "size-7";
  const imageSize = size === "sm" ? 24 : 28;

  if (workspace.image) {
    return (
      <img
        alt={workspace.name}
        className={cn(sizeClass, "rounded-lg object-cover")}
        height={imageSize}
        src={workspace.image}
        width={imageSize}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-neutral-600 font-medium text-white",
        size === "sm" ? "size-6 text-xs" : "size-7 text-lg"
      )}
    >
      {workspace.name.charAt(0).toUpperCase()}
    </div>
  );
}
