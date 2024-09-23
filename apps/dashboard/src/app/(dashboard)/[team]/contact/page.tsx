import { MailIcon } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="flex h-screen flex-col p-3">
      <h1 className="text-3xl font-medium">Contact</h1>
      <p className="text-[#666666]">
        Please notice, that our contact service is not always avaiable.
      </p>
      <div className="mt-3 flex items-center space-x-3">
        {/* TODO: add discord link */}
        <Link
          className="flex items-center"
          href={"mailto:support@selfmail.app"}
        >
          <MailIcon className="mr-2 h-4 w-4" />
          support@selfmail.app
        </Link>
        <Link href={"https://github.com/i-am-henri/selfmail"}>GitHub</Link>
      </div>
    </div>
  );
}
