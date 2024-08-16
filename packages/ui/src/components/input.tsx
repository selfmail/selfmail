"use client";

import { cn } from "../cn";
export const InputStyles = "border-2 border-[#dddddddd] p-2 rounded-xl bg-[#f4f4f4] focus-visible:outline-none focus-visible:border-[#666666]"
/**
 * The default text input.
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}
function Input({ placeholder, ...props }: InputProps) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className={cn(

        props.className,
      )}
      {...props}
    />
  );
}
interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}
function PasswordInput({ ...props }: PasswordInputProps) {
  return (
    <input
      type="password"
      className={cn(
        InputStyles,
        props.className,
      )}
      {...props}
    />
  );
}
interface EmailInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}
function EmailInput({ ...props }: EmailInputProps) {
  return (
    <input
      type="email"
      {...props}
      className={cn(
        InputStyles,
        props.className,
      )}
    />
  );
}

function FileInput() {
  return <input type="file" />;
}

function NumberInput() {
  return <input type="number" />;
}

function UrlInput() {
  return <input type="url" />;
}

export { EmailInput, FileInput, Input, NumberInput, PasswordInput, UrlInput };

