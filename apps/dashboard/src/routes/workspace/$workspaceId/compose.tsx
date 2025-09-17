import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
} from "ui";
import { z } from "zod";
import DashboardLayout from "@/components/layout/dashboard";
import { RequireAuth } from "@/lib/auth";
import { client } from "@/lib/client";
import { RequireWorkspace, useWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/workspace/$workspaceId/compose")({
	component: AuthComponent,
});

function AuthComponent() {
	const { workspaceId } = Route.useParams();
	return (
		<RequireAuth>
			<RequireWorkspace workspaceId={workspaceId}>
				<ComposeEmail workspaceId={workspaceId} />
			</RequireWorkspace>
		</RequireAuth>
	);
}

const schema = z.object({
	to: z.email({ message: "Invalid email address" }),
	cc: z.string().optional(),
	bcc: z.string().optional(),
	subject: z.string().min(1, { message: "Subject is required" }),
	body: z.string().min(1, { message: "Body is required" }),
	address: z.email({ message: "Invalid email address" }),
});

function ComposeEmail({ workspaceId }: { workspaceId: string }) {
	const navigate = Route.useNavigate();

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			address: "",
			bcc: "",
			cc: "",
			to: "",
			subject: "",
			body: "",
		},
	});

	const workspace = useWorkspace(workspaceId);

	const { data: addresses } = useQuery({
		queryKey: ["addresses", workspace?.member.id],
		queryFn: async () => {
			const addresses = await client.v1.web.dashboard.addresses.get({
				query: {
					workspaceId,
				},
			});

			return addresses;
		},
	});

	const { mutate } = useMutation({
		mutationKey: ["sendEmail", workspace?.member.id],
		mutationFn: async (data: z.infer<typeof schema>) => {
			await client.v1.web.workspace({ workspaceId })["send-email"].post(
				{
					from: data.address,
					to: data.to.split(",").map((email) => email.trim()),
					subject: data.subject,
					text: data.body,
					workspaceId,
				},
				{
					query: {
						workspaceId,
					},
				},
			);
		},
	});

	function onSubmit(values: z.infer<typeof schema>) {
		mutate(values, {
			onSuccess: () => {
				toast.success("Email sent successfully");
			},
		});
	}

	return (
		<DashboardLayout workspaceId={workspaceId} showNav={false}>
			<h2 className="flex items-center space-x-1 text-lg">
				<ChevronLeft
					onClick={() => {
						if (window.history.length > 1) {
							window.history.back();
						}

						navigate({
							to: "/workspace/$workspaceId",
							params: {
								workspaceId
							}
						})
					}}
					className="h-5 w-5 cursor-pointer text-neutral-700"
					aria-label="Go back"
				/>
				<span>Compose new Email</span>
			</h2>
			{addresses?.data ? (
				<Form {...form}>
					<form
						className="space-y-3 first-of-type:mt-6"
						onSubmit={form.handleSubmit(onSubmit)}
					>
						<FormField
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>From</FormLabel>
									<FormControl>
										<select
											className="flex w-full rounded-md border border-neutral-100 bg-neutral-100 px-3 py-2 pr-4 text-sm outline-none ring-offset-background transition-colors file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground hover:bg-neutral-200 focus-visible:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
											{...field}
										>
											<option value="">Select sender address</option>
											{addresses?.data.map((addr) => (
												<option key={addr.id} value={addr.email}>
													{addr.email}
												</option>
											))}
										</select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							name="to"
							render={({ field }) => (
								<FormItem>
									<FormLabel>To</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter recipient email, separate with comma for multiple contacts"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="cc"
							render={({ field }) => (
								<FormItem>
									<FormLabel>CC</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter CC emails (optional)"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="bcc"
							render={({ field }) => (
								<FormItem>
									<FormLabel>BCC</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter BCC emails (optional)"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="subject"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Subject</FormLabel>
									<FormControl>
										<Input placeholder="Enter subject" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name="body"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Body</FormLabel>
									<FormControl>
										<textarea
											className="flex w-full rounded-md border border-neutral-100 bg-neutral-100 px-3 py-2 text-sm outline-none ring-offset-background transition-colors file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground hover:bg-neutral-200 focus-visible:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
											placeholder="Enter email body"
											rows={8}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit">Send Email</Button>
					</form>
				</Form>
			) : (
				<div>Loading sender addresses...</div>
			)}
		</DashboardLayout>
	);
}
