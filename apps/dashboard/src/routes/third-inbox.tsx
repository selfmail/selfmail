import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/third-inbox")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className=" grid h-screen w-full grid-cols-6 gap-3 bg-white p-3">
			<div className="col-span-1 h-full rounded-xl bg-neutral-50" />
			<div className="col-span-2 h-full rounded-xl bg-neutral-50" />
			<div className="col-span-3 h-full rounded-xl bg-neutral-50" />
		</div>
	);
}
