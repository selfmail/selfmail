import { createFileRoute } from "@tanstack/react-router";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "ui";

export const Route = createFileRoute("/auth/verify")({
	component: RouteComponent,
});

function RouteComponent() {
	const handleOtpComplete = (value: string) => {
		verifyOtp(value);
	};

	const verifyOtp = async (otpValue: string) => {
		// Add your checks here
		// Call your API here
		console.log("Verifying OTP:", otpValue);
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<h1 className="mb-4 text-2xl">Enter OTP</h1>
			<p>
				We have send you an email to your email address with a six-figure code.
			</p>
			<InputOTP maxLength={6} onComplete={handleOtpComplete}>
				<InputOTPGroup>
					<InputOTPSlot index={0} />
					<InputOTPSlot index={1} />
					<InputOTPSlot index={2} />
					<InputOTPSlot index={3} />
					<InputOTPSlot index={4} />
					<InputOTPSlot index={5} />
				</InputOTPGroup>
			</InputOTP>
			<p>Problems with the input field?</p>
		</div>
	);
}
