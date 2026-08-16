import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/contact/")({
	head: () => ({
		meta: [
			{ title: m["meta.contact.title"]() },
			{
				name: "description",
				content: m["meta.contact.description"](),
			},
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const problemLabels = {
		"2fa": m["contact.problems.two_factor"](),
		"email-access": m["contact.problems.email_access"](),
		"email-delivery": m["contact.problems.email_delivery"](),
		other: m["contact.problems.other"](),
		passkey: m["contact.problems.passkey"](),
	} as const;
	const problemOptions = [
		["email-access", problemLabels["email-access"]],
		["passkey", problemLabels.passkey],
		["email-delivery", problemLabels["email-delivery"]],
		["2fa", problemLabels["2fa"]],
		["other", problemLabels.other],
	] as const;

	return (
		<div className="flex w-full justify-center">
			<a
				className="absolute top-5 hidden text-center font-medium text-xl sm:block"
				href="https://selfmail.app"
			>
				Selfmail
			</a>
			<div className="flex w-full flex-col gap-4 px-5 sm:px-10 md:w-100 md:px-0">
				<h1 className="pb-4 text-center font-medium text-2xl">
					{m["contact.title"]()}
				</h1>
				<form className="flex flex-col gap-4" noValidate>
					<input
						className="w-full rounded-full border-2 border-input bg-transparent px-6 py-3 text-foreground outline-none ring-ring/50 transition-colors duration-200 focus-within:border-ring focus-within:ring-2 focus:outline-none"
						name="name"
						placeholder={m["contact.name_placeholder"]()}
						required
						type="text"
					/>
					<input
						className="w-full rounded-full border-2 border-input bg-transparent px-6 py-3 text-foreground outline-none ring-ring/50 transition-colors duration-200 focus-within:border-ring focus-within:ring-2 focus:outline-none"
						name="email"
						placeholder={m["contact.email_placeholder"]()}
						required
						type="email"
					/>
					<Select name="problem" required>
						<SelectTrigger
							aria-label={m["contact.problem_aria_label"]()}
							className="min-h-12 w-full rounded-full border-2 border-input bg-transparent px-6 py-3 text-base text-foreground outline-none ring-ring/50 transition-colors duration-200 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 data-[size=default]:h-auto data-[size=sm]:h-auto data-placeholder:text-muted-foreground"
						>
							<SelectValue placeholder={m["contact.problem_placeholder"]()}>
								{(value) => {
									if (!value || typeof value !== "string") {
										return m["contact.problem_placeholder"]();
									}

									const label =
										problemLabels[value as keyof typeof problemLabels] ?? value;

									return (
										<span className="block truncate pr-2" title={label}>
											{label}
										</span>
									);
								}}
							</SelectValue>
						</SelectTrigger>
						<SelectContent className="rounded-[39px] border-2 border-border bg-popover p-2 text-popover-foreground shadow-none">
							{problemOptions.map(([value, label]) => (
								<SelectItem
									className="cursor-pointer rounded-full px-4 py-3 text-base focus:bg-accent focus:text-accent-foreground"
									key={value}
									title={label}
									value={value}
								>
									<span className="block truncate">{label}</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<input
						className="w-full rounded-full border-2 border-input bg-transparent px-6 py-3 text-foreground outline-none ring-ring/50 transition-colors duration-200 focus-within:border-ring focus-within:ring-2 focus:outline-none"
						name="subject"
						placeholder={m["contact.subject_placeholder"]()}
						required
						type="text"
					/>
					<textarea
						className="min-h-32 w-full resize-y rounded-3xl border-2 border-input bg-transparent px-6 py-4 text-foreground outline-none ring-ring/50 transition-colors duration-200 focus-within:border-ring focus-within:ring-2 focus:outline-none"
						name="message"
						placeholder={m["contact.message_placeholder"]()}
						required
					/>
					<button
						className="hit-area-4 w-full cursor-pointer rounded-full bg-primary px-6 py-3 text-primary-foreground transition-colors duration-200 focus-within:bg-primary/80 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background hover:bg-primary/80 focus:outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
						type="submit"
					>
						{m["contact.submit_button"]()}
					</button>
				</form>
				<p className="text-balance pt-4 text-center text-muted-foreground text-sm">
					{m["contact.help_hint_before_link"]()}{" "}
					<Link className="hit-area-2 text-blue-600 hover:underline dark:text-blue-400" to="/help">
						{m["contact.help_hint_link"]()}
					</Link>
					{m["contact.help_hint_after_link"]()}
				</p>
			</div>
		</div>
	);
}
