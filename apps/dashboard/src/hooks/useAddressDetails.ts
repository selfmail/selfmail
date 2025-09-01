import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";

export function useAddressDetails(workspaceId: string, addressId: string) {
	return useQuery({
		queryKey: ["address", "details", workspaceId, addressId],
		queryFn: async () => {
			const response = await client.v1.web.address({ addressId }).details.get({
				query: { workspaceId },
			});
			if (response.error) {
				throw new Error(
					typeof response.error.value === "string"
						? response.error.value
						: "Failed to fetch address details",
				);
			}
			return response.data;
		},
		enabled: !!workspaceId && !!addressId,
	});
}
