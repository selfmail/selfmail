import { useIntersection } from "@mantine/hooks";
import { type InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import DashboardLayout from "@/components/layout/dashboard";
import { useTitle } from "@/hooks/useTitle";
import { RequireAuth } from "@/lib/auth";
import { client } from "@/lib/client";
import { RequireWorkspace, useWorkspace } from "@/lib/workspace";

// Type for a single activity (inspired by ActivityList)
interface Activity {
	id: string;
	title: string;
	type: string;
	description?: string;
	createdAt: string | Date;
}

interface ActivityPageResponse {
	activities: Activity[];
	totalCount: number;
	page: number;
	limit: number;
	totalPages: number;
}

export const Route = createFileRoute("/workspace/$workspaceId/activity")({
	component: RouteComponent,
});

function RouteComponent() {
	const { workspaceId } = Route.useParams();

	return (
		<RequireAuth>
			<RequireWorkspace workspaceId={workspaceId}>
				<ActivityPage workspaceId={workspaceId} />
			</RequireWorkspace>
		</RequireAuth>
	);
}

function ActivityPage({ workspaceId }: { workspaceId: string }) {
	const workspace = useWorkspace(workspaceId);

	useTitle(
		`${workspace?.workspace.name || "Workspace"} - Activity`,
		"Activity - Selfmail",
	);

	return (
		<DashboardLayout
			title="Activity of your Workspace"
			workspaceId={workspaceId}
			showNav={false}
			showBackButton={true}
		>
			<ActivityList workspaceId={workspaceId} />
		</DashboardLayout>
	);
}

function ActivityList({ workspaceId }: { workspaceId: string }) {
	const { entry, ref } = useIntersection({ threshold: 0.1 });
	const {
		data,
		isPending,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status,
		error,
	} = useInfiniteQuery<
		ActivityPageResponse,
		Error,
		InfiniteData<ActivityPageResponse>,
		[string, string],
		number
	>({
		queryKey: ["activities", workspaceId],
		queryFn: async ({ pageParam }) => {
			const page = (pageParam as number) ?? 1;
			const response = await client.v1.web.activity.many.get({
				query: { page, limit: 20, workspaceId },
			});
			if (response.error) {
				const errorMessage =
					typeof response.error.value === "string"
						? response.error.value
						: response.error.value?.message || "Failed to fetch activities";
				throw new Error(errorMessage);
			}
			return response.data as ActivityPageResponse;
		},
		getNextPageParam: (lastPage: ActivityPageResponse) => {
			if (lastPage.page < lastPage.totalPages) {
				return lastPage.page + 1;
			}
			return undefined;
		},
		initialPageParam: 1,
		refetchOnWindowFocus: false,
	});

	// Auto-fetch next page when intersection observed
	if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
		fetchNextPage();
	}

	if (isPending) {
		return <div>Loading activities...</div>;
	}
	if (status === "error") {
		return (
			<div>Error loading activities: {error?.message || "Unknown error"}</div>
		);
	}

	const allActivities: Activity[] =
		data?.pages?.flatMap((page: ActivityPageResponse) => page.activities) ?? [];

	return (
		<div>
			{allActivities.length === 0 ? (
				<div>No activities found.</div>
			) : (
				<div className="divide-y divide-gray-200">
					{allActivities.map((activity) => (
						<div
							className="flex items-center justify-between py-2"
							key={activity.id}
						>
							<div className="flex flex-col space-y-1">
								<h2 className="font-normal text-lg">{activity.title}</h2>
								<div>{activity.description}</div>
							</div>
							<div>
								{new Date(activity.createdAt).toLocaleDateString()}:{" "}
								{new Date(activity.createdAt).toLocaleTimeString()}
							</div>
						</div>
					))}
				</div>
			)}
			{hasNextPage && (
				<div ref={ref}>
					{isFetchingNextPage ? "Loading more..." : "Scroll to load more..."}
				</div>
			)}
		</div>
	);
}
