import { useIntersection } from "@mantine/hooks";
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { client } from "@/lib/client";
import type { ApiEmailData, EmailData } from "@/types/email";
import { transformApiEmail } from "@/types/email";
import Email from "./email";

interface EmailListProps {
	onEmailClick: (email: EmailData) => void;
	workspace: string;
	clickRef?: React.RefObject<HTMLDivElement>;
}

interface EmailResponse {
	emails: ApiEmailData[];
	totalCount: number;
	page: number;
	limit: number;
	totalPages: number;
}

export default function EmailList({
	onEmailClick,
	workspace,
	clickRef,
}: EmailListProps) {
	const loadMoreRef = useRef<HTMLDivElement>(null);
	const queryClient = useQueryClient();

	const { entry, ref } = useIntersection({
		threshold: 0.1,
	});

	// Mutation for marking emails as read/unread
	const markEmailAsReadMutation = useMutation({
		mutationFn: async ({
			emailId,
			read,
		}: {
			emailId: string;
			read: boolean;
		}) => {
			const response = await client.v1.web.dashboard
				.emails({ id: emailId })
				.read.patch(
					{
						read,
					},
					{
						query: {
							workspaceId: workspace,
						},
					},
				);

			if (response.error) {
				throw new Error(
					response.error.value?.message || "Failed to update email status",
				);
			}

			return response.data;
		},
		onMutate: async ({ emailId, read }) => {
			// Cancel outgoing refetches so they don't overwrite our optimistic update
			await queryClient.cancelQueries({
				queryKey: ["emails", workspace],
			});

			// Snapshot the previous value
			const previousEmails = queryClient.getQueryData(["emails", workspace]);

			// Optimistically update the cache
			queryClient.setQueryData(["emails", workspace], (old: unknown) => {
				if (!old || typeof old !== "object") return old;
				const typedOld = old as { pages: { emails: ApiEmailData[] }[] };

				return {
					...typedOld,
					pages: typedOld.pages.map((page) => ({
						...page,
						emails: page.emails.map((email: ApiEmailData) =>
							email.id === emailId
								? { ...email, read, readAt: read ? new Date() : null }
								: email,
						),
					})),
				};
			});

			return { previousEmails };
		},
		onError: (_err, _variables, context) => {
			// If the mutation fails, use the context to roll back
			if (context?.previousEmails) {
				queryClient.setQueryData(["emails", workspace], context.previousEmails);
			}
		},
		onSettled: () => {
			// Always refetch after error or success to ensure we have the latest data
			queryClient.invalidateQueries({
				queryKey: ["emails", workspace],
			});
		},
	});

	// Function to handle email click with automatic mark as read
	const handleEmailClick = (email: EmailData) => {
		// If email is unread, mark it as read optimistically
		if (email.unread) {
			markEmailAsReadMutation.mutate({ emailId: email.id, read: true });
		}
		onEmailClick(email);
	};

	const {
		data,
		isLoading,
		isError,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: ["emails", workspace], // Include workspace in queryKey for proper caching
		queryFn: async ({ pageParam = 1 }): Promise<EmailResponse> => {
			const res = await client.v1.web.dashboard.emails.get({
				query: {
					limit: 20,
					page: pageParam,
					workspaceId: workspace,
				},
			});

			if (res.error) {
				const errorText = res.error.value.message;
				throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
			}

			const data = res.data;

			// Transform the API response to match our expected structure
			const transformedEmails = data.emails.map(
				(email: Record<string, unknown>): ApiEmailData => ({
					id: String(email.id),
					subject: String(email.subject || ""),
					body: String(email.text || email.html || ""), // Use text or html as body
					html: email.html ? String(email.html) : null,
					attachments: Array.isArray(email.attachments)
						? email.attachments.map(String)
						: [],
					contactId: String(email.contactId || email.id), // fallback to email id
					addressId: String(email.addressId || ""),
					date:
						email.date instanceof Date
							? email.date
							: new Date(String(email.date)),
					read: Boolean(email.read), // Add read status
					readAt: email.readAt instanceof Date ? email.readAt : null,
				}),
			);
			return {
				...data,
				emails: transformedEmails,
			};
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			// Fix: Check if current page is less than total pages
			return lastPage.page < lastPage.totalPages
				? lastPage.page + 1
				: undefined;
		},
		retry: 3,
		retryDelay: 1000,
		staleTime: 2 * 60 * 1000, // 2 minutes - emails change more frequently
		gcTime: 5 * 60 * 1000, // 5 minutes cache time
	});

	const allEmails =
		data?.pages.flatMap((page) => page.emails.map(transformApiEmail)) ?? [];

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
							key={email.id}
							ref={ref}
							email={email}
							onClick={() => handleEmailClick(email)}
						/>
					);
				}
				return (
					<Email
						key={email.id}
						email={email}
						onClick={() => handleEmailClick(email)}
					/>
				);
			})}

			{/* Load more trigger element */}
			<div ref={loadMoreRef} className="flex h-16 items-center justify-center">
				{isFetchingNextPage ? (
					<div className="text-neutral-500">Loading more emails...</div>
				) : hasNextPage ? (
					<div className="text-neutral-400">Scroll to load more</div>
				) : allEmails.length > 0 ? (
					<div className="text-neutral-400">No more emails</div>
				) : null}
			</div>
		</div>
	);
}
