import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { client } from "@/lib/client";
import type { EmailData } from "@/types/email";
import Email from "./email";

interface EmailListProps {
	onEmailClick: (email: EmailData) => void;
	clickRef?: React.RefObject<HTMLDivElement>;
}

interface EmailResponse {
	emails: {
		body: string;
		id: string;
		subject: string;
		html: string | null;
		attachments: string[];
		contactId: string;
		addressId: string;
		date: Date;
	}[];
	totalCount: number;
	page: number;
	limit: number;
	totalPages: number;
}

export default function EmailList({ onEmailClick, clickRef }: EmailListProps) {
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
				const res = await client.v1.web.dashboard.emails.get({
					query: {
						limit: 20,
						page: pageParam,
					},
				});

				if (res.error) {
					const errorText = res.error.value.message;
					console.error("Response error:", errorText);
					throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
				}

				const data = res.data;
				console.log("Fetched data:", data);
				return data;
			} catch (fetchError) {
				console.error("Fetch error:", fetchError);
				throw fetchError;
			}
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			return lastPage.totalCount !== lastPage.page
				? lastPage.page + 1
				: undefined;
		},
		retry: 3,
		retryDelay: 1000,
	});

	console.log("Query state:", { isLoading, isError, data });

	const allEmails = data?.pages.flatMap((page) => page.emails) ?? [];

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
		<div ref={clickRef} className="flex w-full flex-col space-y-2">
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
