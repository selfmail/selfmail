import { QueryProvider } from "@/components/provider/query";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "ui/globals.css";
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
				<QueryProvider>
					<ThemeProvider
						attribute="class"
						disableTransitionOnChange
						enableSystem
					>
						<TooltipProvider>
							{children}
							<Toaster />
						</TooltipProvider>
					</ThemeProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
