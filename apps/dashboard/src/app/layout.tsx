import "@/styles/globals.css";
// the ui style file, because without this, the styles won't working
import "ui/styles.css"
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { DialogProvider } from "ui"
import {Toaster} from "sonner"
import CommandMenu from "@/components/elements/command";

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
      <body>
        <DialogProvider>
          {children}
          <Toaster richColors />
          <CommandMenu />
        </DialogProvider>
      </body>
    </html>
  );
}
