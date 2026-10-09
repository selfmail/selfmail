import { SendIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { type SubmitEvent, useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface SampleEmail {
  id: string;
  from: string;
  address: string;
  subject: string;
  body: string;
  time: string;
}

const samples: SampleEmail[] = [
  {
    id: "welcome",
    from: "The selfmail team",
    address: "hello@selfmail.app",
    subject: "Welcome to selfmail",
    body: "Hey there,\n\nYour inbox is ready. This is where your conversations, project updates, and weekend plans come together.\n\nSelect a message to read it, or write a quick note in the compose panel.\n\nSee you around,\nThe selfmail team",
    time: "9:41",
  },
  {
    id: "coffee",
    from: "Alex Morgan",
    address: "alex@example.com",
    subject: "Coffee and a good idea?",
    body: "Hey!\n\nThere’s a new coffee place around the corner. Want to grab a table and talk about that idea we had?\n\nThursday, 10-ish? First round’s on me.\n\nAlex",
    time: "9:32",
  },
  {
    id: "studio",
    from: "Studio North",
    address: "team@example.com",
    subject: "The first sketches are ready",
    body: "Hello,\n\nWe’ve put the first sketches together. Plenty of breathing room, a little personality, and all the details we talked about.\n\nCan’t wait to hear what you think.\n\nYour friends at Studio North",
    time: "9:18",
  },
  {
    id: "weekend",
    from: "Jamie Chen",
    address: "jamie@example.com",
    subject: "Out of office, into the mountains",
    body: "Hi!\n\nThe bags are packed and the forecast looks good. All that’s missing is you.\n\nBring a warm jumper. I’ll bring the snacks.\n\nJamie",
    time: "Yesterday",
  },
  {
    id: "cat",
    from: "Chief Cat Officer",
    address: "cat@example.com",
    subject: "Your keyboard is now my bed",
    body: "Dear human,\n\nFollowing a thorough inspection, I have approved your keyboard for sleeping purposes.\n\nPlease direct all further correspondence to the treat cupboard.\n\nWarm regards (and paws),\nThe Chief Cat Officer",
    time: "Just now",
  },
  {
    id: "orbit",
    from: "Mission Control",
    address: "orbit@example.com",
    subject: "Your inbox has cleared for takeoff",
    body: "Hello, explorer.\n\nAll systems are looking good. Your next great idea is cleared for takeoff.\n\nRemember: even astronauts need a lunch break.\n\nMission Control",
    time: "Just now",
  },
];
const panelClass =
  "min-w-0 overflow-hidden rounded-2xl border border-border/70 bg-background";

function ComposePanel() {
  const [notice, setNotice] = useState("");
  function send(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
    setNotice("Delivered by imaginary pigeon. It’s taking a snack break now.");
  }
  return (
    <aside
      aria-label="Compose a demo email"
      className={cn(panelClass, "hidden flex-col 2xl:flex")}
    >
      <h2 className="flex h-16 shrink-0 items-center border-border/70 border-b px-6 font-medium text-sm tracking-tight">
        New message
      </h2>
      <form
        className="flex min-h-0 flex-1 flex-col"
        onChange={() => setNotice("")}
        onSubmit={send}
      >
        <label className="flex items-center gap-4 border-border/60 border-b px-6 py-4 text-sm">
          <span className="w-10 shrink-0 text-muted">From</span>
          <input
            aria-label="From"
            className="min-w-0 flex-1 bg-transparent"
            name="from"
            placeholder="you@example.com"
            required
            type="email"
          />
        </label>
        <label className="flex items-center gap-4 border-border/60 border-b px-6 py-4 text-sm">
          <span className="w-10 shrink-0 text-muted">To</span>
          <input
            aria-label="To"
            className="min-w-0 flex-1 bg-transparent"
            name="to"
            placeholder="friend@example.com"
            required
            type="email"
          />
        </label>
        <input
          aria-label="Subject"
          className="border-border/60 border-b bg-transparent px-6 py-4 text-sm placeholder:text-muted"
          maxLength={255}
          name="subject"
          placeholder="Subject"
          required
        />
        <textarea
          aria-label="Message"
          className="playground-scroll min-h-32 flex-1 resize-none bg-transparent p-6 text-sm leading-7 placeholder:text-muted"
          name="body"
          placeholder="Write a message…"
          required
        />
        <div className="space-y-3 border-border/70 border-t p-6">
          <p className="text-muted text-xs">
            Demo only · no email will be sent.
          </p>
          <button
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-background text-sm hover:opacity-80"
            type="submit"
          >
            <SendIcon className="size-4" />
            Send
          </button>
          <output aria-live="polite" className="block text-muted text-sm">
            {notice}
          </output>
        </div>
      </form>
    </aside>
  );
}

export function EmailPlayground() {
  const [emails, setEmails] = useState(samples.slice(0, 4));
  const [selected, setSelected] = useState(samples[0]);
  const [arrivedId, setArrivedId] = useState<string>();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    let timer: ReturnType<typeof setTimeout>;
    let sequence = 0;
    function schedule() {
      timer = setTimeout(
        () => {
          if (desktop.matches && !document.hidden) {
            const sample = samples[(sequence + 4) % samples.length];
            if (sample) {
              const email = {
                ...sample,
                id: `arrival-${sequence}`,
                time: "Just now",
              };
              setEmails((current) => [email, ...current].slice(0, 12));
              setArrivedId(email.id);
              sequence += 1;
            }
          }
          schedule();
        },
        5000 + Math.random() * 10_000
      );
    }
    schedule();
    return () => clearTimeout(timer);
  }, []);

  if (!selected) {
    return null;
  }

  return (
    <section
      aria-label="Email playground"
      className="mt-6 pb-10"
      id="email-playground"
    >
      <img
        alt="An example selfmail inbox with an email list and an open welcome message"
        className="w-full rounded-xl border border-border bg-background lg:hidden dark:brightness-90 dark:invert"
        height={620}
        src="/email-playground.svg"
        width={960}
      />
      <div className="hidden h-[clamp(720px,80dvh,960px)] grid-cols-[1.1fr_1fr] gap-4 lg:grid 2xl:grid-cols-[1.2fr_1fr_1fr]">
        <div className={cn(panelClass, "flex flex-col")}>
          <div className="flex h-16 shrink-0 items-center justify-between border-border/70 border-b px-6">
            <h2 className="font-medium text-sm tracking-tight">Inbox</h2>
            <span className="text-muted text-xs">Playground</span>
          </div>
          <div className="playground-scroll min-h-0 flex-1 overflow-y-auto">
            {emails.map((email) => (
              <motion.button
                animate={{ opacity: 1, y: 0 }}
                aria-current={email.id === selected.id ? "true" : undefined}
                className={cn(
                  "flex w-full gap-4 border-border/50 border-b px-6 py-5 text-left hover:bg-surface/70 focus-visible:-outline-offset-2",
                  email.id === selected.id && "bg-surface"
                )}
                initial={
                  email.id === arrivedId && !reducedMotion
                    ? { opacity: 0, y: -12 }
                    : false
                }
                key={email.id}
                onClick={() => setSelected(email)}
                transition={{ duration: 0.25 }}
                type="button"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface font-medium text-muted text-xs">
                  {email.from
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-medium text-sm">
                      {email.from}
                    </span>
                    <span className="shrink-0 text-muted text-xs">
                      {email.time}
                    </span>
                  </span>
                  <span className="mt-1.5 block truncate text-sm">
                    {email.subject}
                  </span>
                  <span className="mt-1.5 line-clamp-2 block text-muted text-xs leading-5">
                    {email.body.replaceAll("\n", " ")}
                  </span>
                </span>
              </motion.button>
            ))}
          </div>
        </div>
        <aside
          aria-label="Email preview"
          className={cn(panelClass, "flex flex-col")}
        >
          <h2 className="flex h-16 shrink-0 items-center border-border/70 border-b px-6 font-medium text-sm tracking-tight">
            Email preview
          </h2>
          <div className="playground-scroll min-h-0 flex-1 overflow-y-auto p-7 2xl:p-8">
            <h3 className="mb-8 text-balance font-medium text-2xl leading-tight tracking-tight">
              {selected.subject}
            </h3>
            <div className="mb-8 flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-muted text-sm">
                {selected.from[0]}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-sm">{selected.from}</p>
                <p className="break-all text-muted text-xs">
                  {selected.address}
                </p>
                <p className="mt-1 text-muted text-xs">
                  To: you@example.com · {selected.time}
                </p>
              </div>
            </div>
            <p className="whitespace-pre-line text-sm leading-7">
              {selected.body}
            </p>
          </div>
        </aside>
        <ComposePanel />
      </div>
    </section>
  );
}
