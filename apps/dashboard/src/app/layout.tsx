import Providers from "@/components/provider";
import Sidebar from "@/components/sidebar";
import TeamSidebar from "@/components/team-sidebar";
import { cn } from "@/lib/cn";
import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import "styles/styles.css";
import "ui/styles.css";



export const metadata: Metadata = {
  title: "Home | Dashboard",
  description: "Selfmail Dashboard to view, create and manage your and the emails from your team.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(GeistSans.variable, "antialiased")}>
        <Providers>
          <div className="flex min-h-screen w-full">
            <TeamSidebar />
            <Sidebar />
            <div className="flex-1 min-w-0">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
