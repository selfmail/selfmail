import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";

export type UserWorkspace = {
	name: string;
	image: string | null;
	id: string;
	slug: string;
};

export const useUserWorkspaces = () => {
	return useQuery({
		queryKey: ["user-workspaces"],
		queryFn: async () => {
			const response = await client.v1.web.workspace.user.get();

			if (response.error) {
				throw new Error("Failed to fetch workspaces");
			}

			return response.data as UserWorkspace[];
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};
