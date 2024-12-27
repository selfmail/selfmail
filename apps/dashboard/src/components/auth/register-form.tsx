"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "auth/auth-client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";
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
import { FileUpload } from "../file-upload";

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
	name: z
		.string()
		.min(2, {
			message: "Name must be at least 2 characters.",
		})
		.max(100, {
			message: "Name must be at most 100 characters.",
		}),
});

interface RegisterPageProps {
	nextPage: () => void;
	setUsername: (username: string) => void;
	setPassword: (password: string) => void;
	setName: (name: string) => void;
	alreadyLoggedIn: boolean;
}

interface SetAddressPageProps {
	nextPage: () => void;
	setEmail: (email: string) => void;
}

interface CreateOrganizationPageProps {
	username: string;
	password: string;
	name: string;
	email: string;
	setOrganization: (organization: string) => void;
	organization: string;
}

export function RegisterForm({
	alreadyLoggedIn,
}: {
	alreadyLoggedIn: boolean;
}) {
	const [page, setPage] = useState<
		"register" | "set-adress" | "create-organization"
	>("register");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [email, setEmail] = useState("");
	const [organization, setOrganization] = useState("");
	const [name, setName] = useState("");

	return (
		<>
			{page === "register" && (
				<RegisterPage
					nextPage={() => setPage("set-adress")}
					setUsername={setUsername}
					setPassword={setPassword}
					setName={setName}
					alreadyLoggedIn={alreadyLoggedIn}
				/>
			)}
			{page === "set-adress" && (
				<SetAddressPage
					nextPage={() => setPage("create-organization")}
					setEmail={setEmail}
				/>
			)}
			{page === "create-organization" && (
				<CreateOrganizationPage
					username={username}
					password={password}
					name={name}
					email={email}
					setOrganization={setOrganization}
					organization={organization}
				/>
			)}
		</>
	);
}

const RegisterPage = ({
	nextPage,
	setUsername,
	setPassword,
	alreadyLoggedIn,
	setName,
}: RegisterPageProps) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
			password: "",
			name: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setUsername(values.username);
		setPassword(values.password);
		setName(values.name);
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
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
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
				{(alreadyLoggedIn && (
					<div className="text-center text-sm border-t pt-4">
						You are already logged in.{" "}
						<Link href="/dashboard" className="underline underline-offset-4">
							Go to dashboard
						</Link>
					</div>
				)) || (
					<div className="text-center text-sm border-t pt-4">
						Already have an account?{" "}
						<Link href="/auth/login" className="underline underline-offset-4">
							Login
						</Link>
					</div>
				)}
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

const SetAddressPage = ({ nextPage, setEmail }: SetAddressPageProps) => {
	const form = useForm<z.infer<typeof adressSchema>>({
		resolver: zodResolver(adressSchema),
		defaultValues: {
			email: "",
		},
	});

	async function onSubmit(values: z.infer<typeof adressSchema>) {
		setEmail(values.email);
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

const CreateOrganizationPage = ({
	username,
	password,
	name,
	email,
	setOrganization,
	organization,
}: CreateOrganizationPageProps) => {
	const form = useForm<z.infer<typeof organizationSchema>>({
		resolver: zodResolver(organizationSchema),
		defaultValues: {
			organization: "",
		},
	});

	async function onSubmit(values: z.infer<typeof organizationSchema>) {
		setOrganization(values.organization);
		console.log(email, password, name, username);
		// creating the new user
		const user = await authClient.signUp.email({
			email,
			password,
			name,
			username,
		});

		if (user.error?.status) {
			toast.error(`${user.error.status}: ${user.error.statusText}`);
			return;
		}

		const org = await authClient.organization.create({
			name: organization,
			slug: organization.toLowerCase().replace(/ /g, "-"),
		});

		if (org.error || !org.data) {
			toast.error(
				`We got an error when creating your org: ${org.error.statusText}`,
			);
			return;
		}

		// set this as the active organization
		await authClient.organization.setActive({
			organizationId: org.data.id,
		});

		redirect(`/${organization.toLowerCase().replace(/ /g, "-")}`);
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
					<FileUpload
						form={form}
						onFileSelect={() => {
							console.log("file selected");
						}}
					/>
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
