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
						className="w-full rounded-full border-2 border-neutral-200 px-6 py-3 outline-none ring-neutral-200 transition-colors duration-200 focus-within:border-neutral-400 focus-within:ring-2 focus:outline-none"
						name="name"
						placeholder={m["contact.name_placeholder"]()}
						required
						type="text"
					/>
					<input
						className="w-full rounded-full border-2 border-neutral-200 px-6 py-3 outline-none ring-neutral-200 transition-colors duration-200 focus-within:border-neutral-400 focus-within:ring-2 focus:outline-none"
						name="email"
						placeholder={m["contact.email_placeholder"]()}
						required
						type="email"
					/>
					<Select name="problem" required>
						<SelectTrigger
							aria-label={m["contact.problem_aria_label"]()}
							className="min-h-12 w-full rounded-full border-2 border-neutral-200 bg-transparent px-6 py-3 text-base outline-none ring-neutral-200 transition-colors duration-200 focus-visible:border-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 data-[size=default]:h-auto data-[size=sm]:h-auto data-placeholder:text-neutral-500"
						>
							<SelectValue placeholder={m["contact.problem_placeholder"]()}>
								{(value) => {
									if (!value || typeof value !== "string") {
										return m["contact.problem_placeholder"]();
									}

									return (
										problemLabels[value as keyof typeof problemLabels] ?? value
									);
								}}
							</SelectValue>
						</SelectTrigger>
						<SelectContent className="rounded-[39px] border-2 border-neutral-200 bg-white p-2 shadow-none">
							<SelectItem
								className="cursor-pointer rounded-full px-4 py-3 text-base focus:bg-neutral-100 focus:text-neutral-900"
								value="email-access"
							>
								{m["contact.problems.email_access"]()}
							</SelectItem>
							<SelectItem
								className="cursor-pointer rounded-full px-4 py-3 text-base focus:bg-neutral-100 focus:text-neutral-900"
								value="passkey"
							>
								{m["contact.problems.passkey"]()}
							</SelectItem>
							<SelectItem
								className="cursor-pointer rounded-full px-4 py-3 text-base focus:bg-neutral-100 focus:text-neutral-900"
								value="email-delivery"
							>
								{m["contact.problems.email_delivery"]()}
							</SelectItem>
							<SelectItem
								className="cursor-pointer rounded-full px-4 py-3 text-base focus:bg-neutral-100 focus:text-neutral-900"
								value="2fa"
							>
								{m["contact.problems.two_factor"]()}
							</SelectItem>
							<SelectItem
								className="cursor-pointer rounded-full px-4 py-3 text-base focus:bg-neutral-100 focus:text-neutral-900"
								value="other"
							>
								{m["contact.problems.other"]()}
							</SelectItem>
						</SelectContent>
					</Select>
					<input
						className="w-full rounded-full border-2 border-neutral-200 px-6 py-3 outline-none ring-neutral-200 transition-colors duration-200 focus-within:border-neutral-400 focus-within:ring-2 focus:outline-none"
						name="subject"
						placeholder={m["contact.subject_placeholder"]()}
						required
						type="text"
					/>
					<textarea
						className="min-h-32 w-full resize-y rounded-3xl border-2 border-neutral-200 px-6 py-4 outline-none ring-neutral-200 transition-colors duration-200 focus-within:border-neutral-400 focus-within:ring-2 focus:outline-none"
						name="message"
						placeholder={m["contact.message_placeholder"]()}
						required
					/>
					<button
						className="hit-area-4 w-full cursor-pointer rounded-full bg-neutral-900 px-6 py-3 text-white transition-colors duration-200 focus-within:bg-neutral-700 focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 hover:bg-neutral-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
						type="submit"
					>
						{m["contact.submit_button"]()}
					</button>
				</form>
				<p className="text-balance pt-4 text-center text-neutral-700 text-sm">
					{m["contact.help_hint_before_link"]()}{" "}
					<Link className="hit-area-2 text-blue-500 hover:underline" to="/help">
						{m["contact.help_hint_link"]()}
					</Link>
					{m["contact.help_hint_after_link"]()}
				</p>
			</div>
		</div>
	);
}
