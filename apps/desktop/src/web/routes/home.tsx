import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  SelfmailLogo,
} from "@selfmail/ui";
import { Link } from "wouter";

export default function Home() {
  return (
    <main className="min-h-dvh bg-[rgb(var(--background))] px-6 py-10 text-[rgb(var(--foreground))]">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-8 shadow-sm">
          <Badge className="w-fit" variant="secondary">
            Shared UI package
          </Badge>
          <SelfmailLogo className="h-10 w-auto text-[rgb(var(--foreground))]" />
          <div className="max-w-2xl space-y-3">
            <h1 className="text-balance font-semibold text-4xl">
              Desktop now consumes the shared Selfmail design system.
            </h1>
            <p className="text-pretty text-[rgb(var(--muted-foreground))] text-base">
              Brand tokens, shadcn-style components, and native-ready
              foundations now live in <code>@selfmail/ui</code>.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/inbox">Open inbox</Link>
            </Button>
            <Button asChild variant="outline">
              <a href="https://selfmail.app" rel="noreferrer" target="_blank">
                Visit site
              </a>
            </Button>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            [
              "Secure",
              "Brand-safe tokens and typed primitives for account and inbox surfaces.",
            ],
            [
              "Shared",
              "One React package exports logos, utilities, overlays, form controls, and layout pieces.",
            ],
            [
              "Native-ready",
              "A separate native entry exposes starter primitives without coupling this repo to Expo.",
            ],
          ].map(([title, copy]) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{copy}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-[rgb(var(--muted-foreground))] text-sm">
                Available from <code>@selfmail/ui</code>.
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
