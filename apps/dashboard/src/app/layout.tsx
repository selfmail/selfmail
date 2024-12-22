import Header from "@/components/header";
import DashboardSidebar from "@/components/sidebar";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "ui/globals.css";
import { SidebarProvider } from "ui/sidebar";
import { Toaster } from "ui/sonner";
import { TooltipProvider } from "ui/tooltip";

export const metadata: Metadata = {
	title: "Selfmail Dashboard",
	description: "The dashboard of the selfmail project.",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			suppressHydrationWarning
			lang="en"
			className={`${GeistSans.variable}`}
		>
			<body>
				<ThemeProvider attribute="class" disableTransitionOnChange enableSystem>
					<TooltipProvider>
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
						<Toaster />
					</TooltipProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
