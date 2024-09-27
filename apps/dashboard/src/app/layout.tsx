import CommandMenu from "@/components/elements/command";
import { ThemeProvider } from "@/components/provider/providers";
import type { Metadata } from "next";

// fonts and toaster
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";

// styles for the different components
import "@/styles/globals.css";
import "styles/styles.css";
import "ui/styles.css";

export const metadata: Metadata = {
  title: {
    default: "Selfmail | Dashboard",
    template: "%s | Selfmail",
  },
  description: "The dashboard of selfmail.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="text-text bg-background">
        {/* Themes by next-themes */}
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          {children}
          {/* Sonner toaster */}
          <Toaster richColors />
          {/* Command menu */}
          <CommandMenu />
        </ThemeProvider>
      </body>
    </html>
  );
}
