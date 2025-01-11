"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "auth/auth-client";
import { useActiveOrganization } from "auth/hooks";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
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

export function LoginForm({
	alreadyLoggedIn,
}: {
	alreadyLoggedIn: boolean;
}) {
	const [organization, setOrganization] = useState<string>("/dashboard");

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const { data: activeOrg } = useActiveOrganization();

	useEffect(() => {
		async function getOrg() {
			const org = await authClient.organization.list();

			if (!org.data || org.data.length === 0 || !org.data[0]) {
				toast.error(
					"Error at fetching the organizations. Please try it again later. You have propably no active organization at the time!",
				);
				return;
			}

			return org.data[0].id;
		}
		if (alreadyLoggedIn && activeOrg) {
			setOrganization(`${activeOrg.id}`);
		} else {
			const org = getOrg();
			if (!org) {
				toast.error("You have no active organizations. Please contact us!");
				return;
			}
			setOrganization(`${org}`);
		}
	}, [alreadyLoggedIn, activeOrg]);

	// login the user
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
		const organization = await authClient.organization.list();

		if (!organization.data?.[0]?.id) {
			toast.error("No organization found. Please try to contact us.");
			return;
		}

		// set this as the active organization
		await authClient.organization.setActive({
			organizationId: organization.data[0].id,
		});

		redirect(`/dashboard/${organization.data[0].id}`);
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
				{(!alreadyLoggedIn && (
					<div className="text-center text-sm border-t pt-4">
						Don&apos;t have an account?{" "}
						<Link
							href="/auth/register"
							className="underline underline-offset-4"
						>
							Sign up
						</Link>
					</div>
				)) || (
						<div className="text-center text-sm border-t pt-4">
							You are already logged in.{" "}
							<p
								onClick={() => {
									redirect(`/dashboard/${organization}`)
								}}
								onKeyDown={() => {
									redirect(`/dashboard/${organization}`)
								}}
								className="underline underline-offset-4 cursor-pointer"
							>
								Go to dashboard
							</p>
						</div>
					)}
			</form>
		</Form>
	);
}
