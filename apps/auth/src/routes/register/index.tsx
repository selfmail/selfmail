import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2Icon, XIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { type ZodError, z } from "zod";
import EnterpriseWorkInProgressDialog from "#/components/EnterpriseWorkInProgressDialog";
import { Google } from "#/components/ui/svgs/google";
import { handleRegisterForm, type RegisterResult } from "#/lib/register";
import { getAppRedirectUrlFn, getCurrentUserFn } from "#/lib/session";
import { m } from "#/paraglide/messages";

const { fieldContext, formContext, useFieldContext, useFormContext } =
	createFormHookContexts();

const TextField = ({ placeholder }: { placeholder: string }) => {
	const field = useFieldContext<string>();
	const [firstError] = field.state.meta.errors as ZodError[];

	return (
		<div>
			<input
				className="w-full rounded-full border-2 border-neutral-200 px-6 py-3 outline-none ring-neutral-200 transition-colors duration-200 focus-within:border-neutral-400 focus-within:ring-2 focus:outline-none"
				name={field.name}
				onBlur={field.handleBlur}
				onChange={(event) => {
					field.handleChange(event.target.value);
				}}
				placeholder={placeholder}
				type="text"
				value={field.state.value}
			/>
			{firstError ? (
				<p className="px-2 pt-1 text-red-600 text-sm">
					{String(firstError.message)}
				</p>
			) : null}
		</div>
	);
};

const EmailField = ({ placeholder }: { placeholder: string }) => {
	const field = useFieldContext<string>();
	const [firstError] = field.state.meta.errors as ZodError[];

	return (
		<div>
			<input
				className="w-full rounded-full border-2 border-neutral-200 px-6 py-3 outline-none ring-neutral-200 transition-colors duration-200 focus-within:border-neutral-400 focus-within:ring-2 focus:outline-none"
				name={field.name}
				onBlur={field.handleBlur}
				onChange={(event) => {
					field.handleChange(event.target.value);
				}}
				placeholder={placeholder}
				type="email"
				value={field.state.value}
			/>
			{firstError ? (
				<p className="px-2 pt-1 text-red-600 text-sm">
					{String(firstError.message)}
				</p>
			) : null}
		</div>
	);
};

const SubmitButton = ({ children }: { children: ReactNode }) => {
	const form = useFormContext();

	return (
		<button
			className="hit-area-4 w-full cursor-pointer rounded-full bg-neutral-900 px-6 py-3 text-white transition-colors duration-200 focus-within:bg-neutral-700 focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 hover:bg-neutral-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
			disabled={form.state.isSubmitting}
			type="submit"
		>
			{children}
		</button>
	);
};

const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
		EmailField,
	},
	formComponents: {
		SubmitButton,
	},
	fieldContext,
	formContext,
});

export const Route = createFileRoute("/register/")({
	head: () => ({
		meta: [
			{ title: m["meta.register.title"]() },
			{
				name: "description",
				content: m["meta.register.description"](),
			},
		],
	}),
	component: RouteComponent,
	loader: async () => ({
		currentUser: await getCurrentUserFn(),
		dashboardUrl: await getAppRedirectUrlFn(),
	}),
});

const DashboardHint = ({
	dashboardUrl,
	onDismiss,
}: {
	dashboardUrl: string;
	onDismiss: () => void;
}) => {
	return (
		<div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-700 text-sm">
			<div className="flex items-start gap-3">
				<p className="flex-1 text-pretty">
					{m["register.dashboard_hint.text"]()}{" "}
					<a
						className="font-medium text-neutral-900 underline underline-offset-2"
						href={dashboardUrl}
					>
						{m["register.dashboard_hint.link"]()}
					</a>
					.
				</p>
				<button
					aria-label={m["register.dashboard_hint.dismiss_label"]()}
					className="hit-area-2 rounded-full p-1 text-neutral-500 transition-colors duration-200 hover:bg-neutral-200 hover:text-neutral-900"
					onClick={(event) => {
						event.preventDefault();
						event.stopPropagation();
						onDismiss();
					}}
					type="button"
				>
					<XIcon className="size-4" />
				</button>
			</div>
		</div>
	);
};

function RouteComponent() {
	const { currentUser, dashboardUrl } = Route.useLoaderData();
	const [isDashboardHintDismissed, setIsDashboardHintDismissed] =
		useState(false);
	const navigate = useNavigate();
	const [submitError, setSubmitError] = useState<string | null>(null);

	const registerSchema = z.object({
		name: z.string().min(1, m["register.errors.name_required"]()),
		email: z
			.email(m["login.errors.email_invalid"]())
			.min(1, m["login.errors.email_required"]()),
	});

	const getSubmitErrorMessage = (
		result: Extract<RegisterResult, { status: "error" }>,
	) => {
		switch (result.error.code) {
			case "EMAIL_TAKEN":
				return m["register.errors.email_taken"]();
			case "RATE_LIMITED":
				return m["register.errors.rate_limited"]();
			default:
				return `${result.error.message} Request ID: ${result.error.requestId}`;
		}
	};

	const form = useAppForm({
		defaultValues: {
			name: "",
			email: "",
		},
		onSubmit: async (values) => {
			setSubmitError(null);

			const result = await handleRegisterForm({
				data: values.value,
			});

			if (result.status === "success") {
				await navigate({
					to: "/register/success",
					search: {
						email: values.value.email,
					},
				});
				return;
			}

			setSubmitError(getSubmitErrorMessage(result));
		},
		validators: {
			onSubmit: registerSchema,
		},
	});
	return (
		<>
			<a
				className="absolute top-5 hidden font-medium text-xl sm:block"
				href="https://selfmail.app"
			>
				Selfmail
			</a>
			<div className="flex w-full flex-col gap-2 px-5 sm:px-10 md:w-100 md:px-0">
				<h1 className="pb-4 text-center font-medium text-3xl">
					{m["register.title"]()}
				</h1>
				<form
					className="flex flex-col gap-4 pt-2"
					encType="multipart/form-data"
					method="post"
					onSubmit={(e) => {
						form.handleSubmit();

						e.preventDefault();
					}}
				>
					{currentUser && !isDashboardHintDismissed ? (
						<DashboardHint
							dashboardUrl={dashboardUrl}
							onDismiss={() => {
								setIsDashboardHintDismissed(true);
							}}
						/>
					) : null}
					{submitError ? (
						<div
							aria-live="polite"
							className="text-pretty rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm"
							role="alert"
						>
							{submitError}
						</div>
					) : null}
					<form.AppField name="name">
						{(field) => (
							<field.TextField placeholder={m["register.name_placeholder"]()} />
						)}
					</form.AppField>
					<form.AppField name="email">
						{(field) => (
							<field.EmailField
								placeholder={m["register.email_placeholder"]()}
							/>
						)}
					</form.AppField>
					<form.AppForm>
						<form.SubmitButton>
							{m["register.submit_button"]()}
						</form.SubmitButton>
					</form.AppForm>
					<div className="h-0.5 w-full rounded-full bg-neutral-200" />
					<div className="flex flex-col gap-2">
						<a
							className="relative flex w-full cursor-pointer items-center justify-start rounded-full border-2 border-neutral-200 px-6 py-3 transition-colors duration-200 hover:bg-neutral-100"
							href="/api/login/google"
							type="button"
						>
							<Google className="absolute left-6 h-4 w-4" />
							<span className="ml-8 w-full text-left">
								{m["register.sign_in_google"]()}
							</span>
						</a>
						<EnterpriseWorkInProgressDialog>
							<button
								className="relative flex w-full cursor-pointer items-center justify-start rounded-full border-2 border-neutral-200 px-6 py-3 transition-colors duration-200 hover:bg-neutral-100"
								type="button"
							>
								<Building2Icon className="absolute left-6 h-4 w-4" />

								<span className="ml-8 w-full text-left">
									{m["register.enterprise_setup"]()}
								</span>
							</button>
						</EnterpriseWorkInProgressDialog>
					</div>
					<p className="pt-4 text-center">
						{m["register.login_text"]()}{" "}
						<a
							className="hit-area-2 text-blue-500 hover:underline"
							href="/login"
						>
							{m["register.login_link"]()}
						</a>
					</p>
					<p className="text-balance text-center text-neutral-700 text-sm">
						{m["register.terms_text_before_link"]()}{" "}
						<a className="text-blue-500 hover:underline" href="/terms">
							{m["register.terms_link"]()}
						</a>{" "}
						{m["register.terms_text_middle"]()}{" "}
						<a className="text-blue-500 hover:underline" href="/privacy">
							{m["register.privacy_link"]()}
						</a>{" "}
						{m["register.terms_text_after_link"]()}
					</p>
				</form>
			</div>
		</>
	);
}
