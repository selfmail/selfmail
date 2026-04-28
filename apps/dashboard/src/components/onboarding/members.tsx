import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button, cn, Input, Separator } from "#/components/ui";
import { m } from "#/paraglide/messages";
import { useOnboardingStore } from "#/stores/onboarding";

interface OnboardingMembersProps {
  memberErrors?: Record<string, string>;
}

export function OnboardingMembers({ memberErrors }: OnboardingMembersProps) {
  const { addMemberEmail, data, removeMemberEmail, setMemberEmail } =
    useOnboardingStore();
  const domain = data.useCustomDomain
    ? data.customDomain || "mail.yourdomain.com"
    : `${data.workspaceHandle || "workspace"}.selfmail.app`;
  const cleanMembers = data.memberInvites.filter(({ email }) => email.trim());
  const summaryItems = [
    [
      m.onboarding_review_workspace(),
      data.workspaceName || m.onboarding_not_set(),
    ],
    [
      m.onboarding_review_handle(),
      data.workspaceHandle || m.onboarding_not_set(),
    ],
    [
      m.onboarding_review_address(),
      `${data.defaultAddress || "hello"}@${domain}`,
    ],
    [
      m.onboarding_review_members(),
      cleanMembers.length
        ? m.onboarding_members_invited({ count: cleanMembers.length })
        : m.onboarding_only_you(),
    ],
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-balance text-center font-medium text-3xl">
        {m.onboarding_members_title()}
      </h1>

      <div className="grid gap-6">
        <fieldset className="space-y-3 border-0 p-0">
          <legend className="text-foreground text-sm leading-none">
            {m.onboarding_invite_label()}
          </legend>
          <div className="space-y-3">
            {data.memberInvites.map((memberInvite, index) => (
              <div className="space-y-2" key={memberInvite.id}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <Input
                    aria-describedby={
                      memberErrors?.[memberInvite.id]
                        ? `${memberInvite.id}-error`
                        : undefined
                    }
                    aria-invalid={Boolean(memberErrors?.[memberInvite.id])}
                    aria-label={m.onboarding_invite_input_label({
                      number: index + 1,
                    })}
                    className="flex-1"
                    onChange={(event) =>
                      setMemberEmail(memberInvite.id, event.target.value)
                    }
                    placeholder={m.onboarding_invite_placeholder()}
                    type="email"
                    value={memberInvite.email}
                  />
                  <Button
                    aria-label={m.onboarding_remove_invite()}
                    disabled={
                      data.memberInvites.length === 1 && !memberInvite.email
                    }
                    onClick={() => removeMemberEmail(memberInvite.id)}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
                {memberErrors?.[memberInvite.id] ? (
                  <p
                    className="text-destructive text-sm"
                    id={`${memberInvite.id}-error`}
                  >
                    {memberErrors[memberInvite.id]}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          <Button onClick={addMemberEmail} type="button" variant="outline">
            <PlusIcon className="size-4" />
            {m.onboarding_add_invite()}
          </Button>
        </fieldset>

        <div className="rounded-lg border border-border bg-card p-5">
          <p className="font-medium text-sm">{m.onboarding_review_title()}</p>
          <Separator className="my-4" />
          <dl className="space-y-4">
            {summaryItems.map(([label, value]) => (
              <div className="space-y-1" key={label}>
                <dt className="text-muted-foreground text-xs">{label}</dt>
                <dd
                  className={cn(
                    "truncate font-medium text-sm",
                    value === "Not set" && "text-muted-foreground"
                  )}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
