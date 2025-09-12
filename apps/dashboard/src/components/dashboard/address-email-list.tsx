import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { client } from "@/lib/client";
import type { ApiEmailData, EmailData } from "@/types/email";
import { transformApiEmail } from "@/types/email";
import Email from "./email";

interface AddressEmailListProps {
	onEmailClick: (email: EmailData) => void;
	workspace: string;
	addressId: string;
	clickRef?: React.RefObject<HTMLDivElement>;
	onAddressLoad?: (address: { id: string; email: string }) => void;
}

interface AddressEmailResponse {
	emails: ApiEmailData[];
	totalCount: number;
	page: number;
	limit: number;
	totalPages: number;
	address: {
		id: string;
		email: string;
	};
}

export default function AddressEmailList({
	onEmailClick,
	workspace,
	addressId,
	clickRef,
	onAddressLoad,
}: AddressEmailListProps) {
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
		queryKey: ["address-emails", addressId],
		queryFn: async ({ pageParam = 1 }): Promise<AddressEmailResponse> => {
			const res = await client.v1.web.address.emails({ addressId }).get({
				query: {
					limit: 20,
					page: pageParam,
					addressId,
					workspaceId: workspace,
				},
			});

			if (res.error) {
				const errorText =
					typeof res.error.value === "string"
						? res.error.value
						: res.error.value.message || "Unknown error";
				throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
			}

			type RawAddressEmailResponse = {
				emails: Array<Record<string, unknown>>;
				totalCount: number;
				page: number;
				limit: number;
				totalPages: number;
				address: { id: string; email: string };
			};

			const api = res.data as RawAddressEmailResponse;

			// Normalize server emails into ApiEmailData shape
			const transformedEmails: ApiEmailData[] = api.emails.map(
				(email: Record<string, unknown>): ApiEmailData => {
					const id = String(email.id);
					const subject = String(email.subject ?? "");
					const text = email.text;
					const html = email.html;
					const attachmentsRaw = email.attachments;
					const contactIdRaw = email.contactId;
					const addressIdRaw = email.addressId;
					const dateRaw = email.date;
					const readRaw = email.read;
					const readAtRaw = email.readAt;

					return {
						id,
						subject,
						body: String(
							(text as string | undefined) ??
								(html as string | undefined) ??
								"",
						),
						html: typeof html === "string" ? html : null,
						attachments: Array.isArray(attachmentsRaw)
							? (attachmentsRaw as unknown[]).map((a) => String(a))
							: [],
						contactId: typeof contactIdRaw === "string" ? contactIdRaw : id,
						addressId: typeof addressIdRaw === "string" ? addressIdRaw : "",
						date: dateRaw instanceof Date ? dateRaw : new Date(String(dateRaw)),
						read: Boolean(readRaw),
						readAt:
							readAtRaw instanceof Date
								? readAtRaw
								: readAtRaw
									? new Date(String(readAtRaw))
									: null,
					};
				},
			);

			return {
				emails: transformedEmails,
				totalCount: api.totalCount,
				page: api.page,
				limit: api.limit,
				totalPages: api.totalPages,
				address: api.address,
			};
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			return lastPage.page < lastPage.totalPages
				? lastPage.page + 1
				: undefined;
		},
		retry: 3,
		retryDelay: 1000,
	});

	const allEmails =
		data?.pages.flatMap((page) => page.emails.map(transformApiEmail)) ?? [];

	const addressInfo = data?.pages[0]?.address;

	// Call onAddressLoad when address info is available
	useEffect(() => {
		if (addressInfo && onAddressLoad) {
			onAddressLoad(addressInfo);
		}
	}, [addressInfo, onAddressLoad]);

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
				<div className="text-center text-neutral-500">
					<div className="mb-2">No emails found</div>
					{addressInfo && (
						<div className="text-sm">for {addressInfo.email}</div>
					)}
				</div>
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
							key={email.id}
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
