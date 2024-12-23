import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Selfmail Authentication",
	description: "Authentication page for the selfmail project.",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <div>{children}</div>;
}
