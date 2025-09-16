import { useQuery } from "@tanstack/react-query";
import { Input } from "ui";

export default function ToField({ memberId }: { memberId: string }) {
	const { data } = useQuery({
		queryKey: ["contacts", memberId],
	});

	return <Input placeholder="Search contacts..." />;
}
