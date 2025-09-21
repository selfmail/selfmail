import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";

export function useEmailDetails(emailId: string, workspaceId: string) {
	return useQuery({
		queryKey: ["email", "details", emailId],
		queryFn: async () => {
			const response = await client.v1.web.dashboard
				.emails({ id: emailId })
				.get({
					query: {
						workspaceId,
					},
				});
			if (response.error) {
				throw new Error(
					typeof response.error.value === "string"
						? response.error.value
						: "Failed to fetch email details",
				);
			}
			return response.data;
		},
		enabled: !!emailId,
	});
}
