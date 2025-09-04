import type React from "react";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { routes } from "./generated-routes";

interface PageModule {
	default: React.ComponentType<unknown>;
}

class ClientRouter {
	private routes: Map<string, () => Promise<PageModule>>;
	private root: Root | null = null;

	constructor() {
		this.routes = routes;
		this.setupNavigation();
		this.renderCurrentRoute();
	}

	private setupNavigation() {
		// Handle browser back/forward buttons
		window.addEventListener("popstate", () => {
			this.renderCurrentRoute();
		});

		// Handle link clicks
		document.addEventListener("click", (e) => {
			const target = e.target as HTMLElement;
			const link = target.closest("a");

			if (link?.href?.startsWith(window.location.origin)) {
				e.preventDefault();
				const url = new URL(link.href);
				this.navigate(url.pathname);
			}
		});
	}

	private async renderCurrentRoute() {
		const pathname = window.location.pathname;
		const routeLoader = this.routes.get(pathname);

		if (!routeLoader) {
			console.error(`No route found for ${pathname}`);
			return;
		}

		try {
			const module = await routeLoader();
			const Component = module.default;

			if (!this.root) {
				const rootElement = document.getElementById("root");
				if (rootElement) {
					this.root = createRoot(rootElement);
				}
			}

			if (this.root && Component) {
				const React = await import("react");
				this.root.render(React.createElement(Component));
			}
		} catch (error) {
			console.error("Error loading route:", error);
		}
	}

	public navigate(pathname: string) {
		if (window.location.pathname !== pathname) {
			window.history.pushState({}, "", pathname);
			this.renderCurrentRoute();
		}
	}
}

// Initialize the client router when the page loads
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		new ClientRouter();
	});
} else {
	new ClientRouter();
}
