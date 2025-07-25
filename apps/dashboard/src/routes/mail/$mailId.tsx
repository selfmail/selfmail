import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mail/$mailId")({
	component: RouteComponent,
});

function RouteComponent() {
	const mailId = Route.useParams().mailId;
	console.log(Route.useParams());
	return <div>Hello {mailId}!</div>;
}
