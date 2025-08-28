import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "ui";
import z from "zod";
import { client } from "@/lib/client";

export const Route = createFileRoute("/auth/verify")({
	component: RouteComponent,
});

function RouteComponent() {
	const [error, setError] = useState<string | null>(null);
	const handleEmailComplete = (value: string) => {
		verifyEmail(value);
	};

	const handleEmailVerificationError = (m: string) => {
		toast.error(m);
		setError(m);
	};

	const navigate = useNavigate();

	const verifyEmail = async (token: string) => {
		setError(null);
		const parse = await z
			.number()
			.min(10000)
			.max(999999)
			.safeParseAsync(+token);

		console.log(parse);

		if (!parse.success) {
			handleEmailVerificationError("Invalid OTP format!");
			return;
		}

		const res = await client.v1.web.authentication.verifyEmail.get({
			query: {
				token,
			},
		});

		if (res.error) {
			console.log(res.error);
			handleEmailVerificationError(
				"We had an error during verification of your email. Either try it again or try to login!",
			);
			return;
		}

		return navigate({
			to: "/",
			replace: true,
		});
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<h1 className="mb-4 text-2xl">Enter OTP</h1>
			<p>
				We have send you an email to your email address with a six-figure code.
			</p>
			<InputOTP maxLength={6} onComplete={handleEmailComplete}>
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
