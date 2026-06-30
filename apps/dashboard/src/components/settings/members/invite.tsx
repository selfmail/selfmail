import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@selfmail/ui";
import { useMutation } from "@tanstack/react-query";
import { PlusIcon, SendIcon, XIcon } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { inviteMember } from "#/lib/settings/member";
import { m } from "#/paraglide/messages";

const roleOptions = [
  {
    description: "Can read and manage workspace mail.",
    label: "Member",
    value: "member",
  },
  {
    description: "Can review settings without changing them.",
    label: "Viewer",
    value: "viewer",
  },
] as const;

type RoleValue = (typeof roleOptions)[number]["value"];

export default function InviteMemberMenu({
  memberId,
  workspaceId,
}: {
  memberId: string;
  workspaceId: string;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<RoleValue>(roleOptions[0].value);
  const emailErrorId = useId();
  const emailId = useId();
  const noteId = useId();
  const roleId = useId();
  const invite = useMutation({
    mutationFn: () => {
      console.log({
        email,
        note,
        memberId,
        workspaceId,
      });
      return inviteMember({
        data: {
          email,
          message: note,
          memberId,
          workspaceId,
        },
      });
    },
    onSuccess: () => {
      toast.success("Invite sent", {
        description: `${email} has been invited to the workspace.`,
        id: "invite-member-api",
      });
    },
    onError: (error) => {
      console.log(error);
      toast.error("Invite failed", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        id: "invite-member-api",
      });
    },
  });

  const selectedRole =
    roleOptions.find((roleOption) => roleOption.value === role) ??
    roleOptions[0];

  function handleSubmit() {
    const trimmedEmail = email.trim();

    const parse = z
      .object({
        email: z.email(),
        message: z.string().max(180).optional(),
      })
      .safeParse({ email: trimmedEmail, message: note });

    if (!parse.success) {
      setError("Invalid email address or message too long.");
      return;
    }

    invite.mutate();
  }

  return (
    <TooltipProvider>
      <Dialog onOpenChange={setOpen} open={open}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                aria-label={m["dashboard.settings.member_settings.add"]()}
                className="rounded-full"
                size="icon"
                type="button"
              >
                <PlusIcon aria-hidden="true" className="size-5" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent sideOffset={5}>
            <p>{m["dashboard.settings.member_settings.add"]()}</p>
          </TooltipContent>
        </Tooltip>
        <DialogContent className="relative max-w-lg gap-0 overflow-hidden p-0">
          <DialogClose
            aria-label={m["dashboard.settings.member_settings.close_invite"]()}
            className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            type="button"
          >
            <XIcon aria-hidden="true" className="size-4" />
          </DialogClose>
          <form noValidate onSubmit={handleSubmit}>
            <div className="grid gap-6 p-6">
              <DialogHeader className="pr-8">
                <DialogTitle className="text-xl">
                  {m["dashboard.settings.member_settings.add_title"]()}
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor={emailId}>
                    {m["dashboard.settings.member_settings.current_email"]()}
                  </Label>
                  <Input
                    aria-describedby={error ? emailErrorId : undefined}
                    aria-invalid={Boolean(error)}
                    autoComplete="email"
                    id={emailId}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError(null);
                    }}
                    placeholder={m[
                      "dashboard.settings.member_settings.email_placeholder"
                    ]()}
                    type="email"
                    value={email}
                  />
                  {error ? (
                    <p
                      className="text-pretty text-destructive text-sm"
                      id={emailErrorId}
                    >
                      {error}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={roleId}>Role</Label>
                  <Select
                    onValueChange={(value) =>
                      setRole(value === "viewer" ? "viewer" : "member")
                    }
                    value={role}
                  >
                    <SelectTrigger id={roleId}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((roleOption) => (
                        <SelectItem
                          key={roleOption.value}
                          value={roleOption.value}
                        >
                          {roleOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-pretty text-muted-foreground text-sm">
                    {selectedRole.description}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={noteId}>Message</Label>
                  <Textarea
                    id={noteId}
                    maxLength={180}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Add a short note for the invitation."
                    value={note}
                  />
                  <p className="text-muted-foreground text-sm tabular-nums">
                    {note.length}/180
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="p-4">
              <DialogClose asChild>
                <Button variant="outline">
                  {m["dashboard.settings.cancel"]()}
                </Button>
              </DialogClose>
              <Button type="submit">
                <SendIcon aria-hidden="true" className="size-4" />
                {m["dashboard.settings.member_settings.add"]()}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
