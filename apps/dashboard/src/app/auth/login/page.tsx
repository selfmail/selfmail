import { LoginForm } from "@/components/auth/login-form";
import AuthToast from "@/components/notification/auth-toast";
import { InboxStackIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const message = (await searchParams).message;
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<AuthToast message={message as string} />
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<Link
						href="http://localhost:3000"
						className="flex items-center gap-2 font-medium"
					>
						<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<InboxStackIcon className="size-4" />
						</div>
						Selfmail
					</Link>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<LoginForm />
					</div>
				</div>
			</div>
			<div className="relative hidden bg-muted lg:block">
				<img
					src="/placeholder.svg"
					alt="selfmail background"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
		</div>
	);
}
