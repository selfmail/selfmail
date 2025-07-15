import { createFileRoute } from "@tanstack/react-router";
import DashboardHeader from "@/components/dashboard/header";
import DashboardNavigation from "@/components/dashboard/navigation";

export const Route = createFileRoute("/second-inbox")({
	component: RouteComponent,
});

const mails = [];

function RouteComponent() {
	return (
		<div className="flex flex-col">
			<DashboardHeader />
			<DashboardNavigation />
			<div className="flex flex-col space-x-3 px-32 py-5">
				<h1 className="text-2xl">Unified Inbox</h1>
				<p>
					About 5000 Mails,{" "}
					<span className="font-medium text-black">100 unread</span>
				</p>
			</div>
			<div className="flex flex-col space-y-3 px-32 py-5">
				<div className="flex flex-row items-center">
					<h3>Google</h3>
					<p>Login To your account</p>
				</div>
				<div className="flex flex-row items-center">
					<h3>Google</h3>
					<p>Login To your account</p>
				</div>
				<div className="flex flex-row items-center">
					<h3>Google</h3>
					<p>Login To your account</p>
				</div>
				<div className="flex flex-row items-center">
					<h3>Google</h3>
					<p>Login To your account</p>
				</div>
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
