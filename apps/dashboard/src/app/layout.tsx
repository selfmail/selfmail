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
							<main className="flex">
								{/* Creating the sidebar */}
								<DashboardSidebar />
								{children}
							</main>
						</SidebarProvider>
						<Toaster />
					</TooltipProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
