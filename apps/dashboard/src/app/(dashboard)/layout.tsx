import Header from "@/components/header";
import DashboardSidebar from "@/components/sidebar";
import type { Metadata } from "next";
import { SidebarProvider } from "ui/sidebar";

export const metadata: Metadata = {
	title: "Selfmail Dashboard",
	description: "The dashboard of the selfmail project.",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<SidebarProvider>
			<main className="flex w-full">
				{/* Creating the sidebar */}
				<DashboardSidebar />
				<div className="flex flex-col w-full">
					{/* TODO: passing the right parameters to show the breadcrumbs */}
					<Header>{children}</Header>
				</div>
			</main>
		</SidebarProvider>
	);
}
