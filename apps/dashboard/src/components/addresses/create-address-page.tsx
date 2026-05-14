import {
  Button,
  Dropdown,
  DropdownContent,
  DropdownGroup,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger,
  Input,
} from "@selfmail/ui";
import { Link, useNavigate } from "@tanstack/react-router";
import { CheckIcon, ChevronDownIcon, ChevronLeftIcon } from "lucide-react";
import { type FormEvent, useState } from "react";
import {
  createWorkspaceAddressFn,
  type DashboardAddressDomain,
  type DashboardWorkspace,
} from "#/lib/workspaces";
import { m } from "#/paraglide/messages";

interface CreateAddressPageProps {
  domains: DashboardAddressDomain[];
  workspace: DashboardWorkspace;
}

const toAddressLocalPart = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, "")
    .replace(/^[._-]+|[._-]+$/g, "");

export function CreateAddressPage({
  domains,
  workspace,
}: CreateAddressPageProps) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDomainId, setSelectedDomainId] = useState(
    domains[0]?.id ?? ""
  );
  const navigate = useNavigate();
  const selectedDomain =
    domains.find((domain) => domain.id === selectedDomainId) ?? domains[0];
  const domain = selectedDomain?.domain ?? `${workspace.slug}.selfmail.app`;
  const domainSettingsHref = `/${workspace.slug}/settings#domains`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!address) {
      setError(m["dashboard.address.create.error"]());
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await createWorkspaceAddressFn({
        data: {
          domainId: selectedDomain?.id,
          handle: address,
          workspaceSlug: workspace.slug,
        },
      });

      if (result.status === "error") {
        setError(result.error);
        return;
      }

      await navigate({
        params: {
          addressSlug: result.addressSlug,
          workspaceSlug: workspace.slug,
        },
        to: "/$workspaceSlug/$addressSlug",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center bg-white px-5 py-20 text-foreground">
      <Link
        className="absolute top-5 left-5 inline-flex items-center gap-1 rounded-md py-2 pr-3 font-medium text-neutral-700 text-sm hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
        params={{ workspaceSlug: workspace.slug }}
        to="/$workspaceSlug"
      >
        <ChevronLeftIcon className="size-4" />
        {m["dashboard.address.create.back"]()}
      </Link>

      <form
        className="flex w-full max-w-lg flex-col gap-5"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-4">
          <h1 className="text-balance font-medium text-3xl">
            {m["dashboard.address.create.title"]()}
          </h1>

          <div>
            <label className="sr-only" htmlFor="new-address">
              {m["dashboard.address.create.field_label"]()}
            </label>
            <div className="grid grid-cols-[minmax(7rem,1fr)_minmax(10rem,52%)]">
              <Input
                aria-describedby={error ? "new-address-error" : undefined}
                aria-invalid={Boolean(error)}
                className="rounded-r-none border-r border-r-neutral-300 text-lg"
                id="new-address"
                onChange={(event) => {
                  setAddress(toAddressLocalPart(event.target.value));
                  setError(null);
                }}
                placeholder={m["dashboard.address.create.placeholder"]()}
                value={address}
              />
              <Dropdown>
                <DropdownTrigger
                  className="h-12 min-w-0 cursor-pointer justify-between rounded-l-none border-l-0 px-5 text-lg"
                  title={domain}
                >
                  <span className="min-w-0 truncate">@ {domain}</span>
                  <ChevronDownIcon className="size-4 text-neutral-500" />
                </DropdownTrigger>
                <DropdownContent
                  align="end"
                  className="w-96 max-w-[calc(100vw-2rem)]"
                >
                  <DropdownGroup>
                    <DropdownLabel>
                      {m["dashboard.address.create.domain_label"]()}
                    </DropdownLabel>
                    {domains.map((domain) => (
                      <DropdownItem
                        className="grid-cols-[1rem_minmax(0,1fr)_auto]"
                        icon={
                          domain.id === selectedDomain?.id ? (
                            <CheckIcon className="size-4" />
                          ) : null
                        }
                        key={domain.id}
                        onClick={() => {
                          setSelectedDomainId(domain.id);
                          setError(null);
                        }}
                        title={domain.domain}
                      >
                        @ {domain.domain}
                      </DropdownItem>
                    ))}
                  </DropdownGroup>
                  <DropdownSeparator />
                  <DropdownItem
                    onClick={() => {
                      window.location.href = domainSettingsHref;
                    }}
                  >
                    {m["dashboard.address.create.connect_domain"]()}
                  </DropdownItem>
                </DropdownContent>
              </Dropdown>
            </div>
            {error ? (
              <p
                className="mt-2 text-destructive text-sm"
                id="new-address-error"
              >
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <a
          className="w-fit font-medium text-lg underline underline-offset-4 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
          href={domainSettingsHref}
        >
          {m["dashboard.address.create.connect_domain"]()}
        </a>

        <Button
          className="w-full cursor-pointer text-base"
          disabled={isSubmitting}
          size="lg"
          type="submit"
        >
          {isSubmitting
            ? m["dashboard.address.create.saving"]()
            : m["dashboard.address.create.submit"]()}
        </Button>
      </form>
    </main>
  );
}
