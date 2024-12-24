"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { create } from "zustand";

type State = {
	username: string;
	password: string;
	email: string;
	organization: string;
};

type Action = {
	updateUsername: (username: State["username"]) => void;
	updatePassword: (password: State["password"]) => void;
	updateEmail: (email: State["email"]) => void;
	updateOrganization: (organization: State["organization"]) => void;
};

// Create your store, which includes both state and (optionally) actions
const usePersonStore = create<State & Action>((set) => ({
	username: "",
	password: "",
	email: "",
	organization: "",
	updateUsername: (username) => set(() => ({ username: username })),
	updatePassword: (password) => set(() => ({ password: password })),
	updateEmail: (email) => set(() => ({ email: email })),
	updateOrganization: (organization) =>
		set(() => ({ organization: organization })),
}));

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

export function RegisterForm() {
	// current page
	const [page, setPage] = useState<
		"register" | "set-adress" | "create-organization"
	>("register");

	return (
		<>
			{page === "register" && (
				<RegisterPage nextPage={() => setPage("set-adress")} />
			)}
			{page === "set-adress" && (
				<SetAddressPage nextPage={() => setPage("create-organization")} />
			)}
			{page === "create-organization" && <CreateOrganizationPage />}
		</>
	);
}

const RegisterPage = ({ nextPage }: { nextPage: () => void }) => {
	const { updateUsername, updatePassword } = usePersonStore();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		updateUsername(values.username);
		updatePassword(values.password);
		nextPage();
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={"flex flex-col gap-6"}
			>
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl font-bold">Register a new account</h1>
					<p className="text-balance text-sm text-muted-foreground">
						You can register a new account with your username and password.
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
						Register
					</Button>
				</div>
				<div className="text-center text-sm border-t pt-4">
					Already have an account?{" "}
					<Link href="/auth/login" className="underline underline-offset-4">
						Login
					</Link>
				</div>
			</form>
		</Form>
	);
};

const adressSchema = z.object({
	email: z
		.string()
		.min(2, {
			message: "Email must be at least 2 characters.",
		})
		.max(100, {
			message: "Email must be at most 100 characters.",
		})
		.email()
		.endsWith("@selfmail.app"),
});
const SetAddressPage = ({ nextPage }: { nextPage: () => void }) => {
	const { updateEmail } = usePersonStore();

	const form = useForm<z.infer<typeof adressSchema>>({
		resolver: zodResolver(adressSchema),
		defaultValues: {
			email: "",
		},
	});

	async function onSubmit(values: z.infer<typeof adressSchema>) {
		updateEmail(values.email);
		nextPage();
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={"flex flex-col gap-6"}
			>
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl font-bold">Set your email address</h1>
					<p className="text-balance text-sm text-muted-foreground">
						You can set your email address to receive emails.
					</p>
				</div>
				<div className="grid gap-6">
					<div className="grid gap-2">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											required
											placeholder="Email"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<Button type="submit" className="w-full">
						Set Email
					</Button>
				</div>
				<div className="text-center text-sm border-t pt-4">
					Already have an account?{" "}
					<Link href="/auth/login" className="underline underline-offset-4">
						Login
					</Link>
				</div>
			</form>
		</Form>
	);
};

const organizationSchema = z.object({
	organization: z
		.string()
		.min(2, {
			message: "Organization must be at least 2 characters.",
		})
		.max(100, {
			message: "Organization must be at most 100 characters.",
		}),
});
const CreateOrganizationPage = () => {
	const { updateOrganization } = usePersonStore();

	const form = useForm<z.infer<typeof organizationSchema>>({
		resolver: zodResolver(organizationSchema),
		defaultValues: {
			organization: "",
		},
	});

	async function onSubmit(values: z.infer<typeof organizationSchema>) {
		updateOrganization(values.organization);
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={"flex flex-col gap-6"}
			>
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl font-bold">Create a new organization</h1>
					<p className="text-balance text-sm text-muted-foreground">
						You can create your organization to manage your emails. You adress
						will be added to your organization.
					</p>
				</div>
				<div className="grid gap-6">
					<div className="grid gap-2">
						<FormField
							control={form.control}
							name="organization"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Organization</FormLabel>
									<FormControl>
										<Input
											type="text"
											required
											placeholder="Organization"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<Button type="submit" className="w-full">
						Create Organization
					</Button>
				</div>
				<div className="text-center text-sm border-t pt-4">
					Already have an account?{" "}
					<Link href="/auth/login" className="underline underline-offset-4">
						Login
					</Link>
				</div>
			</form>
		</Form>
	);
};
