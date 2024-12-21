import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "ui/globals.css";

export const metadata: Metadata = {
  title: "Selfmail Dashboard",
  description: "The dashboard of the selfmail project.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning lang="en" className={`${GeistSans.variable}`}>
      <body>
        <ThemeProvider attribute="class" disableTransitionOnChange enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
