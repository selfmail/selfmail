
import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "styles/styles.css";
import "ui/styles.css";

export const metadata: Metadata = {
  title: "Selfmail Smtp-Server",
  description: "Private and secured Smtp-Server for Selfmail products.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
