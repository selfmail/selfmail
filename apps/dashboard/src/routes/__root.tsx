import { Provider } from "@radix-ui/react-tooltip";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
	component: () => (
		<>
			<Provider>
				<Outlet />
			</Provider>
			<TanStackRouterDevtools />
		</>
	),
});
