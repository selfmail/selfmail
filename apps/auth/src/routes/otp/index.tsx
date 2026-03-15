import { createFileRoute, Link } from "@tanstack/react-router";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "#/components/ui/input-otp";

export const Route = createFileRoute("/otp/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <a
        className="absolute top-5 font-medium text-xl"
        href="https://selfmail.app"
      >
        Selfmail
      </a>
      <div className="flex w-full flex-col gap-2 px-5 sm:px-10 md:w-100 md:px-0">
        <h1 className="pb-2 text-center font-medium text-3xl">
          Enter OTP Code{" "}
        </h1>
        <p className="text-balance pb-4 text-center text-neutral-700 text-sm">
          You have an authenticator app connected to your account. Please enter
          the 6-digit code from your app to verify your identity and access your
          account.
        </p>
        <form className="flex flex-col gap-4 pt-2">
          <InputOTP
            className="w-full justify-center"
            containerClassName="w-full justify-center"
            maxLength={6}
            render={({ slots }) => (
              <InputOTPGroup className="w-full">
                {slots.map((slot, index) => (
                  <InputOTPSlot
                    className="h-14 min-w-0 flex-1 text-lg"
                    key={`otp-slot-${index.toString()}`}
                    {...slot}
                  />
                ))}
              </InputOTPGroup>
            )}
          />
          <button
            className="hit-area-4 w-full cursor-pointer rounded-full bg-neutral-900 px-6 py-3 text-white transition-colors duration-200 focus-within:bg-neutral-700 focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 hover:bg-neutral-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
            type="submit"
          >
            Verify Code
          </button>
          <div className="h-0.5 w-full rounded-full bg-neutral-200" />
          <p className="text-center">
            Lost access to authenticator app?{" "}
            <Link
              className="hit-area-2 text-blue-500 hover:underline"
              to="/otp/backup-codes"
            >
              Use backup codes
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
