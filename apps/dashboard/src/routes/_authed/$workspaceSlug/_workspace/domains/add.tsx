import { Button, Input } from "@selfmail/ui";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { z } from "zod";

export const Route = createFileRoute(
	"/_authed/$workspaceSlug/_workspace/domains/add",
)({
	component: RouteComponent,
});

const domainPattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
const protocolPattern = /^https?:\/\//;
const wwwPattern = /^www\./;
const pathPattern = /\/.*$/;
const domainError = "Enter a valid domain, without https://.";

const toDomainName = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(protocolPattern, "")
		.replace(wwwPattern, "")
		.replace(pathPattern, "");

const domainSchema = z
	.string()
	.transform(toDomainName)
	.pipe(z.string().regex(domainPattern, domainError));

function RouteComponent() {
	const { workspace } = Route.useRouteContext();
	const router = useRouter();
	const [domain, setDomain] = useState("");
	const [error, setError] = useState<string | null>(null);

	const handleBack: ComponentProps<"button">["onClick"] = () => {
		if (router.history.canGoBack()) {
			router.history.back();
			return;
		}

		void router.navigate({
			params: { workspaceSlug: workspace.slug },
			to: "/$workspaceSlug",
		});
	};

	const handleSubmit: ComponentProps<"form">["onSubmit"] = (event) => {
		event.preventDefault();
		const result = domainSchema.safeParse(domain);

		if (!result.success) {
			setError(result.error.issues[0]?.message ?? domainError);
			return;
		}

		setDomain(result.data);
		setError(null);
	};

	return (
		<main className="relative flex min-h-dvh w-full items-center justify-center bg-white px-5 py-20 text-foreground">
			<button
				className="absolute top-5 left-5 inline-flex items-center gap-1 rounded-md py-2 pr-3 font-medium text-neutral-700 text-sm hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
				onClick={handleBack}
				type="button"
			>
				<ChevronLeftIcon className="size-4" />
				Back
			</button>

			<form
				className="flex w-full max-w-lg flex-col gap-5"
				noValidate
				onSubmit={handleSubmit}
			>
				<div className="flex flex-col gap-4">
					<h1 className="text-balance font-medium text-3xl">Add Domain</h1>

					<div>
						<label className="sr-only" htmlFor="new-domain">
							Domain
						</label>
						<Input
							aria-describedby={error ? "new-domain-error" : undefined}
							aria-invalid={Boolean(error)}
							className="text-lg"
							id="new-domain"
							inputMode="url"
							onChange={(event) => {
								setDomain(toDomainName(event.target.value));
								setError(null);
							}}
							placeholder="yourdomain.com"
							value={domain}
						/>
						{error ? (
							<p
								className="mt-2 text-destructive text-sm"
								id="new-domain-error"
							>
								{error}
							</p>
						) : null}
					</div>
				</div>

				<Button
					className="w-full cursor-pointer text-base"
					size="lg"
					type="submit"
				>
					Add domain
				</Button>
			</form>
		</main>
	);
}
