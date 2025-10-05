import {
    component$,
    type QwikJSX,
    useOnWindow,
    useStore,
    useTask$,
} from "@builder.io/qwik";

type Props = {
    fetchEmails: (params: {
        page: number;
        take: number;
    }) => Promise<(Record<string, unknown> & { id: string })[]>;
    EmailComponent: () => QwikJSX.Element;
};

export default component$<Props>(({ fetchEmails, EmailComponent }) => {
    const emails = useStore({
        emails: [] as (Record<string, unknown> & { id: string })[],
    });

    useTask$(async ({ track }) => {
        track(() => fetchEmails);
        emails.emails = await fetchEmails({ page: 0, take: 20 });
    });

    return (
        <div class="flex w-full flex-col">
            {emails.emails?.map((email: any) => (
                <div key={email.id} class="border-neutral-200 border-b px-4 py-2">
                    <p class="font-medium">{email.from}</p>
                    <p class="text-neutral-600 text-sm">{email.subject}</p>
                    <p class="text-neutral-500 text-sm">{email.snippet}</p>
                </div>
            ))}
            {emails.emails?.length === 0 && (
                <p class="p-4 text-center text-neutral-500 text-sm">No emails found.</p>
            )}
            <EmailComponent />
        </div>
    );
});
