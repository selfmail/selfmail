import InboxList from "@/components/inbox/list";

export default async function OrganizationPage() {
	// get the inbox
	return (
		<div className="flex">
			<InboxList />
		</div>
	);
}
