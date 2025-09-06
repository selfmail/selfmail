import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Paperclip, Send } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Alert,
	AlertDescription,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Separator,
	Textarea,
} from "ui";
import DashboardHeader from "@/components/dashboard/header";
import DashboardNavigation from "@/components/dashboard/navigation";
import { RequireAuth } from "@/lib/auth";
import { client } from "@/lib/client";
import { RequireWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/workspace/$workspaceId/compose")({
	component: RouteComponent,
});

interface EmailAddress {
	id: string;
	email: string;
	name?: string;
	isDefault: boolean;
}

interface ComposeForm {
	from: string;
	to: string;
	cc: string;
	bcc: string;
	subject: string;
	body: string;
	htmlBody: string;
}

function RouteComponent() {
	const { workspaceId } = Route.useParams();

	return (
		<RequireAuth>
			<RequireWorkspace workspaceId={workspaceId}>
				<ComposeEmailPage workspaceId={workspaceId} />
			</RequireWorkspace>
		</RequireAuth>
	);
}

function ComposeEmailPage({ workspaceId }: { workspaceId: string }) {
	const [addresses, setAddresses] = useState<EmailAddress[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [showCC, setShowCC] = useState(false);
	const [showBCC, setShowBCC] = useState(false);

	const [form, setForm] = useState<ComposeForm>({
		from: "",
		to: "",
		cc: "",
		bcc: "",
		subject: "",
		body: "",
		htmlBody: "",
	});

	// Fetch available email addresses for this workspace using the proper client
	useEffect(() => {
		const fetchAddresses = async () => {
			try {
				const result = await client.v1.web
					.workspace({ workspaceId })
					.addresses.get({
						query: { workspaceId },
					});

				if (result.error) {
					throw new Error("Failed to fetch addresses");
				}

				setAddresses(result.data || []);

				// Set default from address
				const defaultAddress = result.data?.find(
					(addr: EmailAddress) => addr.isDefault,
				);
				if (defaultAddress) {
					setForm((prev) => ({ ...prev, from: defaultAddress.email }));
				}
			} catch {
				setError("Failed to load email addresses");
			}
		};

		fetchAddresses();
	}, [workspaceId]);

	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email.trim());
	};

	const validateEmailList = (emailList: string): boolean => {
		if (!emailList.trim()) return true; // Empty is valid
		const emails = emailList.split(",").map((e) => e.trim());
		return emails.every((email) => validateEmail(email));
	};

	const handleInputChange = (field: keyof ComposeForm, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		setError(null);
		setSuccess(null);
	};

	const validateForm = (): string | null => {
		if (!form.from) return "Please select a sender address";
		if (!form.to.trim()) return "Please enter at least one recipient";

		// Validate individual email addresses
		const toEmails = form.to
			.split(",")
			.map((e) => e.trim())
			.filter((e) => e);
		if (toEmails.length === 0) return "Please enter at least one recipient";
		if (!validateEmailList(form.to))
			return "Please enter valid recipient email addresses";

		if (form.cc && !validateEmailList(form.cc))
			return "Please enter valid CC email addresses";
		if (form.bcc && !validateEmailList(form.bcc))
			return "Please enter valid BCC email addresses";
		if (!form.subject.trim()) return "Please enter a subject";
		if (!form.body.trim() && !form.htmlBody.trim())
			return "Please enter email content";

		return null;
	};

	const handleSend = async () => {
		const validationError = validateForm();
		if (validationError) {
			setError(validationError);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const result = await client.v1.web
				.workspace({ workspaceId })
				["send-email"].post(
					{
						from: form.from,
						to: form.to
							.split(",")
							.map((e) => e.trim())
							.filter((e) => e),
						cc: form.cc
							? form.cc
									.split(",")
									.map((e) => e.trim())
									.filter((e) => e)
							: undefined,
						bcc: form.bcc
							? form.bcc
									.split(",")
									.map((e) => e.trim())
									.filter((e) => e)
							: undefined,
						subject: form.subject,
						text: form.body,
						html: form.htmlBody || undefined,
						workspaceId,
					},
					{
						query: { workspaceId },
					},
				);

			if (result.error) {
				throw new Error("Failed to send email");
			}

			setSuccess("Email sent successfully!");
			// Reset form
			setForm({
				from: addresses.find((addr) => addr.isDefault)?.email || "",
				to: "",
				cc: "",
				bcc: "",
				subject: "",
				body: "",
				htmlBody: "",
			});
			setShowCC(false);
			setShowBCC(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to send email");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen flex-col bg-white text-black">
			<DashboardHeader workspaceId={workspaceId} />
			<DashboardNavigation workspaceId={workspaceId} />

			{/* Page container */}
			<div className="mx-auto w-full px-4 sm:px-6 lg:px-26 xl:px-32">
				{/* Page header */}
				<div className="flex items-center justify-between py-6">
					<div>
						<h1 className="font-semibold text-2xl tracking-tight">
							Compose Email
						</h1>
						<p className="mt-1 text-gray-600 text-sm">
							Create and send a new email message
						</p>
					</div>
				</div>

				{/* Main content */}
				<div className="rounded-xl bg-white shadow-sm ring-1 ring-[#E2E8F0]">
					<Card className="border-0 shadow-none">
						<CardHeader className="pb-6">
							<CardTitle className="flex items-center gap-2">
								<Send className="h-5 w-5" />
								New Message
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{error && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							{success && (
								<Alert>
									<AlertCircle className="h-4 w-4" />
									<AlertDescription className="text-green-600">
										{success}
									</AlertDescription>
								</Alert>
							)}

							{/* From Field */}
							<div className="grid gap-2">
								<Label htmlFor="from">From</Label>
								<Select
									value={form.from}
									onValueChange={(value) => handleInputChange("from", value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select sender address" />
									</SelectTrigger>
									<SelectContent>
										{addresses.map((address) => (
											<SelectItem key={address.id} value={address.email}>
												{address.name
													? `${address.name} <${address.email}>`
													: address.email}
												{address.isDefault && " (Default)"}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* To Field */}
							<div className="grid gap-2">
								<Label htmlFor="to">To *</Label>
								<div className="flex items-center gap-2">
									<Input
										id="to"
										placeholder="recipient@example.com, another@example.com"
										value={form.to}
										onChange={(e) => handleInputChange("to", e.target.value)}
										className="flex-1"
									/>
									<div className="flex gap-1">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => setShowCC(!showCC)}
											className={showCC ? "bg-secondary" : ""}
										>
											CC
										</Button>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => setShowBCC(!showBCC)}
											className={showBCC ? "bg-secondary" : ""}
										>
											BCC
										</Button>
									</div>
								</div>
							</div>

							{/* CC Field */}
							{showCC && (
								<div className="grid gap-2">
									<Label htmlFor="cc">CC</Label>
									<Input
										id="cc"
										placeholder="cc@example.com, another@example.com"
										value={form.cc}
										onChange={(e) => handleInputChange("cc", e.target.value)}
									/>
								</div>
							)}

							{/* BCC Field */}
							{showBCC && (
								<div className="grid gap-2">
									<Label htmlFor="bcc">BCC</Label>
									<Input
										id="bcc"
										placeholder="bcc@example.com, another@example.com"
										value={form.bcc}
										onChange={(e) => handleInputChange("bcc", e.target.value)}
									/>
								</div>
							)}

							{/* Subject Field */}
							<div className="grid gap-2">
								<Label htmlFor="subject">Subject *</Label>
								<Input
									id="subject"
									placeholder="Enter email subject"
									value={form.subject}
									onChange={(e) => handleInputChange("subject", e.target.value)}
								/>
							</div>

							<Separator />

							{/* Email Body */}
							<div className="grid gap-2">
								<Label htmlFor="body">Message *</Label>
								<Textarea
									id="body"
									placeholder="Write your email here..."
									value={form.body}
									onChange={(e) => handleInputChange("body", e.target.value)}
									rows={10}
									className="resize-vertical"
								/>
							</div>

							{/* HTML Body (Optional) */}
							<div className="grid gap-2">
								<Label htmlFor="htmlBody">HTML Content (Optional)</Label>
								<Textarea
									id="htmlBody"
									placeholder="<p>HTML version of your email...</p>"
									value={form.htmlBody}
									onChange={(e) =>
										handleInputChange("htmlBody", e.target.value)
									}
									rows={6}
									className="resize-vertical font-mono text-sm"
								/>
							</div>

							<Separator />

							{/* Actions */}
							<div className="flex items-center justify-between pt-4">
								<Button
									type="button"
									variant="outline"
									className="flex items-center gap-2"
									disabled
								>
									<Paperclip className="h-4 w-4" />
									Attachments (Coming Soon)
								</Button>

								<div className="flex gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setForm({
												from:
													addresses.find((addr) => addr.isDefault)?.email || "",
												to: "",
												cc: "",
												bcc: "",
												subject: "",
												body: "",
												htmlBody: "",
											});
											setShowCC(false);
											setShowBCC(false);
											setError(null);
											setSuccess(null);
										}}
									>
										Clear
									</Button>
									<Button
										onClick={handleSend}
										disabled={loading}
										className="flex items-center gap-2"
									>
										{loading ? (
											<>
												<div className="h-4 w-4 animate-spin rounded-full border-white border-b-2" />
												Sending...
											</>
										) : (
											<>
												<Send className="h-4 w-4" />
												Send Email
											</>
										)}
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Bottom spacing */}
			<div className="h-8" />
		</div>
	);
}
