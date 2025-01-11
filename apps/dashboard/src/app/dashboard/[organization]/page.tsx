import InboxList from "@/components/inbox/list";
import View from "@/components/inbox/view";

export default async function OrganizationPage() {
	// get the inbox
	return (
		<div className="flex h-full">
			<InboxList />
			<View />
		</div>
	);
}
