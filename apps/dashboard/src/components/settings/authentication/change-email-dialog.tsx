import {
	Button,
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Input,
	Label,
} from "@selfmail/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { type ComponentProps, type ReactNode, useId, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { changeAccountEmail } from "#/lib/settings/authentication";
import { m } from "#/paraglide/messages";

const emailSchema = z.email();

export function ChangeEmailDialog({
	children,
	currentEmail,
}: {
	children: ReactNode;
	currentEmail: string;
}) {
	const queryClient = useQueryClient();
	const inputId = useId();
	const errorId = useId();
	const [email, setEmail] = useState(currentEmail);
	const [formError, setFormError] = useState<string | null>(null);
	const [open, setOpen] = useState(false);
	const changeEmail = useMutation({
		mutationFn: (newEmail: string) =>
			changeAccountEmail({ data: { email: newEmail } }),
		onError: (error) => setFormError(error.message),
		onSuccess: async ({ email: updatedEmail }) => {
			await queryClient.invalidateQueries({
				queryKey: ["authentication-settings"],
			});
			setEmail(updatedEmail);
			setOpen(false);
			toast.success(m["dashboard.settings.authentication.email_changed"]());
		},
	});

	const handleSubmit: ComponentProps<"form">["onSubmit"] = (event) => {
		event.preventDefault();
		const parsedEmail = emailSchema.safeParse(email.trim().toLowerCase());

		if (!parsedEmail.success) {
			setFormError(m["dashboard.settings.authentication.invalid_email"]());
			return;
		}

		changeEmail.mutate(parsedEmail.data);
	};

	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen);
		setFormError(null);

		if (isOpen) {
			setEmail(currentEmail);
		}
	};

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="relative max-w-lg">
				<DialogClose asChild>
					<Button
						aria-label={m["dashboard.settings.close"]()}
						className="absolute top-4 right-4"
						size="icon-sm"
						type="button"
						variant="ghost"
					>
						<XIcon aria-hidden="true" />
					</Button>
				</DialogClose>
				<form className="grid gap-6" noValidate onSubmit={handleSubmit}>
					<DialogHeader className="pr-8">
						<DialogTitle>
							{m["dashboard.settings.authentication.change_email_title"]()}
						</DialogTitle>
						<DialogDescription>
							{m[
								"dashboard.settings.authentication.change_email_description"
							]()}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-2">
						<Label htmlFor={inputId}>
							{m["dashboard.settings.authentication.new_email"]()}
						</Label>
						<Input
							aria-describedby={formError ? errorId : undefined}
							aria-invalid={Boolean(formError)}
							autoComplete="email"
							autoFocus
							id={inputId}
							onChange={(event) => {
								setEmail(event.target.value);
								setFormError(null);
							}}
							type="email"
							value={email}
						/>
						{formError ? (
							<p className="text-pretty text-destructive text-sm" id={errorId}>
								{formError}
							</p>
						) : null}
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								{m["dashboard.settings.cancel"]()}
							</Button>
						</DialogClose>
						<Button disabled={changeEmail.isPending} type="submit">
							{changeEmail.isPending
								? m["dashboard.settings.authentication.changing_email"]()
								: m["dashboard.settings.authentication.change_email"]()}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
