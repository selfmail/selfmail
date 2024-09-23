import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "styles/styles.css";
import "ui/styles.css";

export const metadata: Metadata = {
  title: {
    default: "Selfmail | your email provider",
    template: "%s | Selfmail",
  },
  description:
    "Selfmail is a collaberative email provider, completely open source.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} flex w-full justify-center  bg-background`}
    >
      <body>
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          <Toaster />
          <div className="px-5 md:px-0">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
