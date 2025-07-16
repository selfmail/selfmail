import { useIntersection } from "@mantine/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Email from "@/components/dashboard/email";
import EmailViewer from "@/components/dashboard/email-viewer";
import DashboardHeader from "@/components/dashboard/header";
import DashboardNavigation from "@/components/dashboard/navigation";
export const Route = createFileRoute("/second-inbox")({
	component: RouteComponent,
});

const mails = [];

function RouteComponent() {
	const [open, setOpen] = useState(true);

	const { entry, ref } = useIntersection({
		threshold: 0,
		rootMargin: "0%",
	});

	useEffect(() => {
		if (entry?.isIntersecting) {
			setOpen(false);
		}
	}, [entry?.isIntersecting]);
	return (
		<div className="flex flex-col">
			<DashboardHeader />
			<DashboardNavigation />
			<div ref={ref} className="flex flex-col space-x-3 px-32 py-5">
				<h1 className="text-2xl">Unified Inbox</h1>
				<p>
					About 5000 Mails,{" "}
					<span className="font-medium text-black">100 unread</span>
				</p>
			</div>
			<EmailViewer open={open} />
			<div className="flex flex-col space-y-3 px-32 py-5">
				<Email />
				<Email />
				<Email />
				<Email />
				<Email />
				<Email />
				<Email />
				<Email />
				<Email />
				<Email />
			</div>
		</div>
	);
}

// if your scroll below to the list,
// a window will open to the right, the header fades
// out and you can select emails which are then displayed
// in the right window

// if you scroll to the top, to the nav, the window will fade out!

// see: https://www.cosmos.so/e/1227529052 (second image)
