// This is the component to list all the emails in the inbox

"use client";

import { countEmails } from "@/actions/inbox/count-emails";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useRef } from "react";

type Email = {
	id: string;
	subject: string;
	from: string;
	date: string;
	adress: string;
	tags: string[];
	preview: string;
};

export default function InboxList() {
	const countEmailsAction = useAction(countEmails);

	const fetchSize = 20;

	const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery<{
		data: Email[];
	}>({
		queryKey: ["emails"],
		queryFn: async ({ pageParam = 0 }) => {
			const start = (pageParam as number) * fetchSize;

			return {
				data: [
					{
						adress: "henri@me.com",
						subject: "Hello",
						from: "henri@me.com",
						date: "2024-01-01",
						tags: ["tag1", "tag2"],
						preview: "Hello, how are you?",
						id: "123",
					},
				],
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
	});

	const emails = useMemo(
		() => data?.pages?.flatMap((page) => page.data) ?? [],
		[data],
	);

	// number of the fetched emails
	const totalFetched = emails.length;
	return (
		<div className="flex flex-col">
			{emails.map((email) => (
				<div key={email.id}>{email.subject}</div>
			))}
			{isFetching && <div>Loading...</div>}
			<p>
				{totalFetched} / {emailCount} Emails
			</p>
		</div>
	);
}
