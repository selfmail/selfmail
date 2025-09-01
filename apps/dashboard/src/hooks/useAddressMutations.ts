import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";

export function useDeleteAddress() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			addressId,
			workspaceId,
		}: {
			addressId: string;
			workspaceId: string;
		}) => {
			const response = await client.v1.web.address.delete.delete(
				{ id: addressId },
				{ query: { workspaceId } },
			);
			if (response.error) {
				throw new Error(
					typeof response.error.value === "string"
						? response.error.value
						: "Failed to delete address",
				);
			}
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["addresses"] });
		},
	});
}
