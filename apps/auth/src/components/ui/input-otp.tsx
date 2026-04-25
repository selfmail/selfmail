import { OTPInput, type SlotProps } from "input-otp";
import { MinusIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "#/libs/utils";

function InputOTP({
	className,
	containerClassName,
	...props
}: ComponentProps<typeof OTPInput> & {
	containerClassName?: string;
}) {
	return (
		<OTPInput
			className={cn("disabled:cursor-not-allowed", className)}
			containerClassName={cn(
				"cn-input-otp group flex items-center has-disabled:opacity-50",
				containerClassName,
			)}
			data-slot="input-otp"
			spellCheck={false}
			{...props}
		/>
	);
}

function InputOTPGroup({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"flex items-center rounded-lg has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40",
				className,
			)}
			data-slot="input-otp-group"
			{...props}
		/>
	);
}

function InputOTPSlot({
	char,
	placeholderChar,
	hasFakeCaret,
	isActive,
	className,
	...props
}: ComponentProps<"div"> & SlotProps) {
	return (
		<div
			className={cn(
				"relative flex size-11 items-center justify-center border-neutral-200 border-y-2 border-r-2 bg-white text-base text-neutral-900 outline-0 outline-neutral-300/20 transition-all first:rounded-l-lg first:border-l-2 last:rounded-r-lg hover:border-neutral-300 group-focus-within:border-neutral-400 group-hover:border-neutral-300 aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-neutral-400 data-[active=true]:outline-3 data-[active=true]:outline-neutral-300 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:outline-destructive/20 data-[active=true]:before:absolute data-[active=true]:before:inset-y-0 data-[active=true]:before:left-0 data-[active=true]:before:w-0.5 data-[active=true]:before:bg-neutral-400 data-[active=true]:before:content-[''] first:data-[active=true]:before:hidden dark:bg-neutral-900 dark:text-neutral-100 dark:data-[active=true]:outline-neutral-500 dark:data-[active=true]:aria-invalid:outline-destructive/40 dark:group-hover:border-neutral-600 dark:group-focus-within:border-neutral-500 dark:hover:border-neutral-600 dark:data-[active=true]:before:bg-neutral-500",
				className,
			)}
			data-active={isActive}
			data-slot="input-otp-slot"
			{...props}
		>
			<div className={cn("font-medium", !char && "text-neutral-400")}>
				{char ?? placeholderChar}
			</div>
			{hasFakeCaret && (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div className="h-5 w-px animate-caret-blink bg-neutral-700 duration-1000 dark:bg-neutral-300" />
				</div>
			)}
		</div>
	);
}

function InputOTPSeparator({ ...props }: ComponentProps<"div">) {
	return (
		<div
			aria-hidden="true"
			className="flex items-center [&_svg:not([class*='size-'])]:size-4"
			data-slot="input-otp-separator"
			{...props}
		>
			<MinusIcon />
		</div>
	);
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
