// This is the component to list all the emails in the inbox

"use client";

import { countEmails } from "@/actions/inbox/count-emails";
import { getNextMails } from "@/actions/inbox/get-next-mails";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

type Email = {
	id: string;
	content: string;
	subject: string | null;
	preview: string | null;
	plainText: string | null;
	createdAt: Date;
	tags: {
		id: string;
		name: string;
	}[];
	adress: {
		email: string;
		id: string;
	};
	sender: {
		email: string;
		id: string;
		name: string;
	};
	organization: {
		name: string;
		id: string;
	};
};

export default function InboxList({
	activeOrgId,
}: {
	activeOrgId: string;
}) {
	const countEmailsAction = useAction(countEmails);

	const fetchSize = 20;

	const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery<{
		data: Email[];
	}>({
		queryKey: ["emails"],
		queryFn: async ({ pageParam = 0, signal }) => {
			const start = (pageParam as number) * fetchSize;

			const emails = await getNextMails({
				from: start,
				take: fetchSize,
			});

			console.log(emails);

			if (emails?.serverError) {
				toast.error(
					`Error fetching emails: ${emails?.serverError.errorMessage}`,
				);
			}

			if (emails?.validationErrors) {
				toast.error(
					`Error fetching emails: ${emails?.validationErrors._errors?.join(", ")}`,
				);
				signal.reason("Error fetching emails");
			}

			console.log(emails?.data);

			return {
				data: emails?.data as Email[],
			};
		},
		initialPageParam: 0,
		getNextPageParam: (_lastGroup, groups) => groups.length,
		refetchOnWindowFocus: false,
	});

	// infinity scroll
	const lastEmailRef = useRef<HTMLDivElement>(null);

	const { entry, ref } = useIntersection({
		root: lastEmailRef.current,
		threshold: 1,
	});

	useEffect(() => {
		if (entry?.isIntersecting) {
			console.log("intersecting");
			fetchNextPage();
		}
	}, [entry, fetchNextPage]);

	const emails = useMemo(
		() => data?.pages?.flatMap((page) => page.data) ?? [],
		[data],
	);

	// number of the fetched emails
	const totalFetched = emails.length;
	return (
		<div className="flex flex-col">
			{isFetching && <div>Loading...</div>}
			<p>{totalFetched} Emails</p>
			<div>
				{emails.map((email) => (
					<div key={email.id} ref={ref}>
						<p>{email.content}</p>
					</div>
				))}
			</div>
		</div>
	);
}
