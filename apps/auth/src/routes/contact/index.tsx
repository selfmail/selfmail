import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";

export const Route = createFileRoute("/contact/")({
  component: RouteComponent,
});

const problemLabels = {
  "2fa": "Lost my 2FA device or backup codes.",
  "email-access": "I can't access my E-Mail address.",
  "email-delivery": "Haven't received an E-Mail.",
  other: "Other",
  passkey: "I can't access my passkey.",
} as const;

function RouteComponent() {
  return (
    <div className="absolute inset-0 flex flex-col items-center sm:static sm:justify-center">
      <a
        className="absolute top-5 text-center font-medium text-xl"
        href="https://selfmail.app"
      >
        Selfmail
      </a>
      <div className="w-full flex-col gap-4 px-5 pt-16 sm:px-10 sm:pt-0 md:w-100 md:px-0">
        <h1 className="pb-4 text-center font-medium text-2xl">Contact Us</h1>
        <form className="flex flex-col gap-4" noValidate>
          <input
            className="w-full rounded-full border-2 border-neutral-200 px-6 py-3 outline-none ring-neutral-200 transition-colors duration-200 focus-within:border-neutral-400 focus-within:ring-2 focus:outline-none"
            name="name"
            placeholder="Your Full Name"
            required
            type="text"
          />
          <input
            className="w-full rounded-full border-2 border-neutral-200 px-6 py-3 outline-none ring-neutral-200 transition-colors duration-200 focus-within:border-neutral-400 focus-within:ring-2 focus:outline-none"
            name="email"
            placeholder="Your E-Mail Address"
            required
            type="email"
          />
          <Select name="problem" required>
            <SelectTrigger
              aria-label="Select a problem"
              className="min-h-12 w-full rounded-full border-2 border-neutral-200 bg-transparent px-6 py-3 text-base outline-none ring-neutral-200 transition-colors duration-200 focus-visible:border-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 data-[size=default]:h-auto data-[size=sm]:h-auto data-placeholder:text-neutral-500"
            >
              <SelectValue placeholder="Select a Problem">
                {(value) => {
                  if (!value || typeof value !== "string") {
                    return "Select a Problem";
                  }

                  return (
                    problemLabels[value as keyof typeof problemLabels] ?? value
                  );
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-[39px] border-2 border-neutral-200 bg-white p-2 shadow-none">
              <SelectItem
                className="cursor-pointer rounded-full px-4 py-3 text-base focus:bg-neutral-100 focus:text-neutral-900"
                value="email-access"
              >
                I can't access my E-Mail address.
              </SelectItem>
              <SelectItem
                className="cursor-pointer rounded-full px-4 py-3 text-base focus:bg-neutral-100 focus:text-neutral-900"
                value="passkey"
              >
                I can't access my passkey.
              </SelectItem>
              <SelectItem
                className="cursor-pointer rounded-full px-4 py-3 text-base focus:bg-neutral-100 focus:text-neutral-900"
                value="email-delivery"
              >
                Haven't received an E-Mail.
              </SelectItem>
              <SelectItem
                className="cursor-pointer rounded-full px-4 py-3 text-base focus:bg-neutral-100 focus:text-neutral-900"
                value="2fa"
              >
                Lost my 2FA device or backup codes.
              </SelectItem>
              <SelectItem
                className="cursor-pointer rounded-full px-4 py-3 text-base focus:bg-neutral-100 focus:text-neutral-900"
                value="other"
              >
                Other
              </SelectItem>
            </SelectContent>
          </Select>
          <input
            className="w-full rounded-full border-2 border-neutral-200 px-6 py-3 outline-none ring-neutral-200 transition-colors duration-200 focus-within:border-neutral-400 focus-within:ring-2 focus:outline-none"
            name="subject"
            placeholder="Subject"
            required
            type="text"
          />
          <textarea
            className="min-h-32 w-full resize-y rounded-3xl border-2 border-neutral-200 px-6 py-4 outline-none ring-neutral-200 transition-colors duration-200 focus-within:border-neutral-400 focus-within:ring-2 focus:outline-none"
            name="message"
            placeholder="How can we help you?"
            required
          />
          <button
            className="hit-area-4 w-full cursor-pointer rounded-full bg-neutral-900 px-6 py-3 text-white transition-colors duration-200 focus-within:bg-neutral-700 focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 hover:bg-neutral-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
            type="submit"
          >
            Send Message
          </button>
        </form>
        <p className="text-balance pt-4 text-center text-neutral-700 text-sm">
          Need quick answers first? Visit our{" "}
          <Link className="hit-area-2 text-blue-500 hover:underline" to="/help">
            Help page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
