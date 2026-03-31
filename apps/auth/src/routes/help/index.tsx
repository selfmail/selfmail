import { createFileRoute, Link } from "@tanstack/react-router";
import { m } from "#/paraglide/messages";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/help/")({
	head: () => ({
		meta: [
			{ title: m["meta.help.title"]() },
			{
				name: "description",
				content: m["meta.help.description"](),
			},
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
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
					{m["help.title"]()}
				</h1>
				<Accordion className={"flex flex-col gap-4"}>
					<AccordionItem
						className="relative w-full rounded-[39px] border-2 border-neutral-200 px-6 py-3 transition duration-200 hover:bg-neutral-100"
						value="email-issues"
					>
						<AccordionTrigger className={"hit-area-4 cursor-pointer text-lg"}>
							{m["help.faq.email_access.title"]()}
						</AccordionTrigger>
						<AccordionContent>
							{m["help.faq.email_access.description_before_link"]()}{" "}
							<Link
								className="hit-area-2 text-blue-500 hover:underline"
								to="/contact"
							>
								{m["help.faq.email_access.description_link"]()}
							</Link>
							{m["help.faq.email_access.description_after_link"]()}
						</AccordionContent>
					</AccordionItem>
					<AccordionItem
						className="relative w-full rounded-[39px] border-2 border-neutral-200 px-6 py-3 transition duration-200 hover:bg-neutral-100"
						value="unknown-error"
					>
						<AccordionTrigger className={"hit-area-4 cursor-pointer text-lg"}>
							{m["help.faq.unknown_error.title"]()}
						</AccordionTrigger>
						<AccordionContent>
							{m["help.faq.unknown_error.description_before_link"]()}{" "}
							<Link
								className="hit-area-2 text-blue-500 hover:underline"
								to="/contact"
							>
								{m["help.faq.unknown_error.description_link"]()}
							</Link>
							{m["help.faq.unknown_error.description_after_link"]()}
						</AccordionContent>
					</AccordionItem>
					<AccordionItem
						className="relative w-full rounded-[39px] border-2 border-neutral-200 px-6 py-3 transition duration-200 hover:bg-neutral-100"
						value="passkey-issues"
					>
						<AccordionTrigger className={"hit-area-4 cursor-pointer text-lg"}>
							{m["help.faq.passkey.title"]()}
						</AccordionTrigger>
						<AccordionContent>
							{m["help.faq.passkey.description_before_link"]()}{" "}
							<Link
								className="hit-area-2 text-blue-500 hover:underline"
								to="/contact"
							>
								{m["help.faq.passkey.description_link"]()}
							</Link>
							{m["help.faq.passkey.description_after_link"]()}
						</AccordionContent>
					</AccordionItem>
					<AccordionItem
						className="relative w-full rounded-[39px] border-2 border-neutral-200 px-6 py-3 transition duration-200 hover:bg-neutral-100"
						value="email-sending-issues"
					>
						<AccordionTrigger className={"hit-area-4 cursor-pointer text-lg"}>
							{m["help.faq.email_delivery.title"]()}
						</AccordionTrigger>
						<AccordionContent>
							{m["help.faq.email_delivery.description_before_link"]()}{" "}
							<Link
								className="hit-area-2 text-blue-500 hover:underline"
								to="/contact"
							>
								{m["help.faq.email_delivery.description_link"]()}
							</Link>
							{m["help.faq.email_delivery.description_after_link"]()}
						</AccordionContent>
					</AccordionItem>
					<AccordionItem
						className="relative w-full rounded-[39px] border-2 border-neutral-200 px-6 py-3 transition duration-200 hover:bg-neutral-100"
						value="2fa-issues"
					>
						<AccordionTrigger className={"hit-area-4 cursor-pointer text-lg"}>
							{m["help.faq.two_factor.title"]()}
						</AccordionTrigger>
						<AccordionContent>
							{m["help.faq.two_factor.description_before_link"]()}{" "}
							<Link
								className="hit-area-2 text-blue-500 hover:underline"
								to="/contact"
							>
								{m["help.faq.two_factor.description_link"]()}
							</Link>
							{m["help.faq.two_factor.description_after_link"]()}
						</AccordionContent>
					</AccordionItem>
				</Accordion>
				<p className="text-balance pt-4 text-center">
					{m["help.still_questions_before_link"]()}{" "}
					<Link
						className="hit-area-2 text-blue-500 hover:underline"
						to="/contact"
					>
						{m["help.still_questions_link"]()}
					</Link>
					{m["help.still_questions_after_link"]()}
				</p>
			</div>
		</div>
	);
}
