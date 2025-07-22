import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { EmailData } from "@/types/email";
import Email from "./email";

interface EmailListProps {
	onEmailClick: (email: EmailData) => void;
}

interface EmailResponse {
	data: EmailData[];
	pagination: {
		page: number;
		limit: number;
		totalCount: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

export default function EmailList({ onEmailClick }: EmailListProps) {
	const loadMoreRef = useRef<HTMLDivElement>(null);

	const { entry, ref } = useIntersection({
		threshold: 0.1,
	});

	const {
		data,
		isLoading,
		isError,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: ["emails"],
		queryFn: async ({ pageParam = 1 }): Promise<EmailResponse> => {
			console.log("Fetching emails page:", pageParam);

			const url = `http://localhost:3000/v1/web/emails?page=${pageParam}&limit=20`;
			console.log("Fetch URL:", url);

			try {
				const response = await fetch(url, {
					method: "GET",
				});

				console.log("Response status:", response.status);
				console.log("Response ok:", response.ok);

				if (!response.ok) {
					const errorText = await response.text();
					console.error("Response error:", errorText);
					throw new Error(
						`HTTP error! status: ${response.status} - ${errorText}`,
					);
				}

				const data = await response.json();
				console.log("Fetched data:", data);
				return data;
			} catch (fetchError) {
				console.error("Fetch error:", fetchError);
				throw fetchError;
			}
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			return lastPage.pagination.hasNextPage
				? lastPage.pagination.page + 1
				: undefined;
		},
		retry: 3,
		retryDelay: 1000,
	});

	console.log("Query state:", { isLoading, isError, data });

	const allEmails = data?.pages.flatMap((page) => page.data) ?? [];

	// Trigger fetchNextPage when the load more element comes into view
	useEffect(() => {
		if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="text-neutral-500">Loading emails...</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="text-red-500">
					Error loading emails:{" "}
					{error instanceof Error ? error.message : "Unknown error"}
					<br />
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="mt-2 rounded bg-blue-500 px-4 py-2 text-white"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	if (!allEmails || allEmails.length === 0) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="text-neutral-500">No emails found</div>
			</div>
		);
	}

	return (
		<div className="flex w-full flex-col space-y-2">
			{allEmails.map((email, index) => {
				if (index === allEmails.length - 1) {
					return (
						<Email
							ref={ref}
							email={email}
							onClick={() => onEmailClick(email)}
						/>
					);
				}
				return (
					<Email
						key={email.id}
						email={email}
						onClick={() => onEmailClick(email)}
					/>
				);
			})}

			{/* Load more trigger element */}
			<div ref={loadMoreRef} className="flex h-16 items-center justify-center">
				{isFetchingNextPage ? (
					<div className="text-neutral-500">Loading more emails...</div>
				) : hasNextPage ? (
					<div className="text-neutral-400">Scroll to load more</div>
				) : (
					<div className="text-neutral-400">No more emails</div>
				)}
			</div>
		</div>
	);
}
