import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertTriangle,
	Calendar,
	CheckCircle,
	Clock,
	Minus,
	User,
} from "lucide-react";
import type { PrismaActivity } from "services/activity";
import { Button, Card, CardContent, CardHeader } from "ui";
import { client } from "@/lib/client";

interface ActivityListProps {
	workspace: string;
}

interface ActivityResponse {
	activities: PrismaActivity[];
	totalCount: number;
	page: number;
	limit: number;
	totalPages: number;
}

const getActivityIcon = (type: string) => {
	switch (type) {
		case "task":
			return <CheckCircle className="h-4 w-4" />;
		case "note":
			return <User className="h-4 w-4" />;
		case "event":
			return <Calendar className="h-4 w-4" />;
		case "reminder":
			return <AlertTriangle className="h-4 w-4" />;
		default:
			return <Minus className="h-4 w-4" />;
	}
};

const getActivityColor = (color: string) => {
	switch (color) {
		case "positive":
			return "bg-green-100 text-green-800 border-green-200";
		case "negative":
			return "bg-red-100 text-red-800 border-red-200";
		default:
			return "bg-gray-100 text-gray-800 border-gray-200";
	}
};

const formatDate = (date: Date | string) => {
	const d = new Date(date);
	const now = new Date();
	const diffMs = now.getTime() - d.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMins < 1) return "Just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;

	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
	});
};

export default function ActivityList({ workspace }: ActivityListProps) {
	const queryClient = useQueryClient();

	const { entry, ref } = useIntersection({
		threshold: 0.1,
	});

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status,
		error,
	} = useInfiniteQuery({
		queryKey: ["activities", workspace],
		queryFn: async ({ pageParam = 1 }) => {
			const response = await client.v1.web.activity.many.get({
				query: {
					page: pageParam,
					limit: 20,
					workspaceId: workspace,
				},
			});

			if (response.error) {
				const errorMessage =
					typeof response.error.value === "string"
						? response.error.value
						: response.error.value?.message || "Failed to fetch activities";
				throw new Error(errorMessage);
			}

			return response.data as ActivityResponse;
		},
		getNextPageParam: (lastPage) => {
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

	if (status === "pending") {
		return (
			<div className="space-y-4">
				{[...Array(5)].map((_, i) => (
					<Card key={`loading-${i.toString()}`} className="animate-pulse">
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between">
								<div className="flex items-center space-x-3">
									<div className="h-4 w-4 rounded bg-gray-300" />
									<div className="h-4 w-32 rounded bg-gray-300" />
								</div>
								<div className="h-6 w-16 rounded-full bg-gray-300" />
							</div>
						</CardHeader>
						<CardContent className="pt-0">
							<div className="mb-2 h-3 w-full rounded bg-gray-300" />
							<div className="h-3 w-2/3 rounded bg-gray-300" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (status === "error") {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="text-center">
						<AlertTriangle className="mx-auto mb-2 h-8 w-8 text-red-500" />
						<p className="mb-2 text-red-600">Failed to load activities</p>
						<p className="text-gray-500 text-sm">
							{error?.message || "Unknown error occurred"}
						</p>
						<Button
							variant="outline"
							size="sm"
							className="mt-3"
							onClick={() =>
								queryClient.invalidateQueries({
									queryKey: ["activities", workspace],
								})
							}
						>
							Try again
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	const allActivities = data?.pages.flatMap((page) => page.activities) ?? [];

	if (allActivities.length === 0) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="py-8 text-center">
						<Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
						<h3 className="mb-2 font-medium text-gray-900 text-lg">
							No activities yet
						</h3>
						<p className="text-gray-500">
							Activities will appear here as you and your team work in this
							workspace.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{allActivities.map((activity) => (
				<Card key={activity.id} className="transition-colors hover:bg-gray-50">
					<CardHeader className="pb-3">
						<div className="flex items-start justify-between">
							<div className="flex items-center space-x-3">
								<div
									className={`rounded-full p-1 ${getActivityColor(activity.color)}`}
								>
									{getActivityIcon(activity.type)}
								</div>
								<div>
									<h4 className="font-medium text-gray-900 text-sm">
										{activity.title}
									</h4>
								</div>
							</div>
							<div className="flex items-center space-x-2">
								<span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700 text-xs">
									{activity.type}
								</span>
								<div className="flex items-center text-gray-500 text-xs">
									<Clock className="mr-1 h-3 w-3" />
									{formatDate(activity.createdAt)}
								</div>
							</div>
						</div>
					</CardHeader>
					{activity.description && (
						<CardContent className="pt-0">
							<p className="text-gray-600 text-sm">{activity.description}</p>
						</CardContent>
					)}
				</Card>
			))}

			{/* Load more trigger */}
			{hasNextPage && (
				<div ref={ref} className="flex justify-center py-4">
					{isFetchingNextPage ? (
						<div className="text-gray-500 text-sm">
							Loading more activities...
						</div>
					) : (
						<Button
							variant="outline"
							onClick={() => fetchNextPage()}
							disabled={isFetchingNextPage}
						>
							Load more
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
