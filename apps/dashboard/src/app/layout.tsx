import Providers from "@/components/provider";
import Sidebar from "@/components/provider/sidebar";
import TeamSidebar from "@/components/provider/team-sidebar";
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
      <body className={GeistSans.variable}>
        <Providers>
          <div className="flex h-screen w-full bg-[var(--bg-main)] transition-colors">
            <TeamSidebar />
            <Sidebar />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
