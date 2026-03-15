import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/help/")({
  component: RouteComponent,
});

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
        <h1 className="pb-4 text-center font-medium text-2xl">
          Help & Support
        </h1>
        <Accordion className={"flex flex-col gap-4"}>
          <AccordionItem
            className="relative w-full rounded-[39px] border-2 border-neutral-200 px-6 py-3 transition duration-200 hover:bg-neutral-100"
            value="email-issues"
          >
            <AccordionTrigger className={"hit-area-4 cursor-pointer text-lg"}>
              I can't access my E-Mail address.
            </AccordionTrigger>
            <AccordionContent>
              If you can't access your E-Mail address connected to your account,
              please contact us via the contact form{" "}
              <Link
                className="hit-area-2 text-blue-500 hover:underline"
                to="/contact"
              >
                here
              </Link>
              . Please also contact us, if you have another email address you'd
              like to connect to your account.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            className="relative w-full rounded-[39px] border-2 border-neutral-200 px-6 py-3 transition duration-200 hover:bg-neutral-100"
            value="unknown-error"
          >
            <AccordionTrigger className={"hit-area-4 cursor-pointer text-lg"}>
              Unknown error occurred.
            </AccordionTrigger>
            <AccordionContent>
              In this case, please try again later or, if this issue keeps
              occurring, please contact us via the contact form{" "}
              <Link
                className="hit-area-2 text-blue-500 hover:underline"
                to="/contact"
              >
                here
              </Link>
              . Copy your request ID from the error message and include it in
              your message to us, so we can investigate the issue.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            className="relative w-full rounded-[39px] border-2 border-neutral-200 px-6 py-3 transition duration-200 hover:bg-neutral-100"
            value="passkey-issues"
          >
            <AccordionTrigger className={"hit-area-4 cursor-pointer text-lg"}>
              I can't access my passkey.
            </AccordionTrigger>
            <AccordionContent>
              {/* TODO: Implement passkey issue resolution */}
              In this case, please try again later or, if this issue keeps
              occurring, please contact us via the contact form{" "}
              <Link
                className="hit-area-2 text-blue-500 hover:underline"
                to="/contact"
              >
                here
              </Link>
              . Copy your request ID from the error message and include it in
              your message to us, so we can investigate the issue.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            className="relative w-full rounded-[39px] border-2 border-neutral-200 px-6 py-3 transition duration-200 hover:bg-neutral-100"
            value="email-sending-issues"
          >
            <AccordionTrigger className={"hit-area-4 cursor-pointer text-lg"}>
              Haven't received an E-Mail.
            </AccordionTrigger>
            <AccordionContent>
              Please try again later, if no error occurs, please take a look
              into your spam folder or contact us{" "}
              <Link
                className="hit-area-2 text-blue-500 hover:underline"
                to="/contact"
              >
                here
              </Link>
              . In order to help you, you need to provide us your email.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            className="relative w-full rounded-[39px] border-2 border-neutral-200 px-6 py-3 transition duration-200 hover:bg-neutral-100"
            value="2fa-issues"
          >
            <AccordionTrigger className={"hit-area-4 cursor-pointer text-lg"}>
              Lost my 2FA device or backup codes.
            </AccordionTrigger>
            <AccordionContent>
              If you've lost your 2FA device (e.g. you can't access your
              authenticator app), please use your backup codes. If you also lost
              them, you need to{" "}
              <Link
                className="hit-area-2 text-blue-500 hover:underline"
                to="/contact"
              >
                contact us here
              </Link>
              . You may need to provide proof of identity, so we can verify that
              you are the rightful owner of the account. After successful
              verification, we can help you regain access to your account.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <p className="text-balance pt-4 text-center">
          Still have questions? Please contact us via the contact form{" "}
          <Link
            className="hit-area-2 text-blue-500 hover:underline"
            to="/contact"
          >
            here
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
