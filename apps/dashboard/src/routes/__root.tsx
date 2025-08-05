import { Provider } from "@radix-ui/react-tooltip";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import notFound from "@/components/pages/not-found";
import { AuthProvider } from "@/lib/auth";

export const Route = createRootRoute({
	notFoundComponent: () => notFound(),
	component: () => (
		<AuthProvider>
			<Provider>
				<Outlet />
			</Provider>
			<TanStackRouterDevtools />
		</AuthProvider>
	),
});
