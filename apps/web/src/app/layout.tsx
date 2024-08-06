import Footer from "@/components/elements/footer";
import Header from "@/components/elements/header";
import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { Metadata } from "next";
import { ThemeProvider } from "next-themes";
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
      className={`${GeistSans.variable} flex w-full justify-center bg-[#e8e8e8]`}
    >
      <body>
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
