"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "auth/auth-client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "ui/form";
import { Input } from "ui/input";
import { z } from "zod";

const formSchema = z.object({
	username: z
		.string()
		.min(2, {
			message: "Username must be at least 2 characters.",
		})
		.max(100, {
			message: "Username must be at most 100 characters.",
		}),
	password: z
		.string()
		.min(8, {
			message: "Password must be at least 8 characters.",
		})
		.max(100, {
			message: "Password must be at most 100 characters.",
		}),
});

export function LoginForm() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		// handle login with better-auth
		const user = await authClient.signIn.username({
			username: values.username,
			password: values.password,
		});

		if (user.error?.status) {
			toast.error(`${user.error.status} - ${user.error.statusText}`);
			return;
		}

		// get the active organization
		const organization = authClient.useActiveOrganization();

		if (!organization.data) {
			toast.error("No active organization found. Please try to contact us.");
			return;
		}

		// redirect to the organization
		redirect(`/${organization.data.id}`);
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={"flex flex-col gap-6"}
			>
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl font-bold">Login to your account</h1>
					<p className="text-balance text-sm text-muted-foreground">
						Enter your email below to login to your account
					</p>
				</div>
				<div className="grid gap-6">
					<div className="grid gap-2">
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Username</FormLabel>
									<FormControl>
										<Input placeholder="Username" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="grid gap-2">
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input type="password" placeholder="Password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<Button type="submit" className="w-full">
						Login
					</Button>
				</div>
				<div className="text-center text-sm border-t pt-4">
					Don&apos;t have an account?{" "}
					<Link href="/auth/register" className="underline underline-offset-4">
						Sign up
					</Link>
				</div>
			</form>
		</Form>
	);
}
