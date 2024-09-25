"use client"
import type React from "react";
import { useState } from "react";
import { cn } from "../cn";
// animated placeholder input element
export const Input: React.FC<Omit<React.InputHTMLAttributes<HTMLInputElement>, "placeholder"> & { placeholder?: string | React.ReactNode }> = ({ placeholder, className, ...props }) => {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className="relative flex items-center">
      <input {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn("rounded-xl w-full outline-none shadow-sm focus-visible:border-foreground duration-100 transition border border-border bg-background-primary px-3 py-1 text-foreground-primary", className)} />
      <div className={cn("text-gray-400 left-3 absolute transition duration-100 pointer-events-none", !isFocused ? "opacity-100" : "opacity-0", value !== "" ? "hidden" : "block", className,)}>
        {placeholder}
      </div>
    </div>
  )
}
export const UrlInput: React.FC<Omit<React.InputHTMLAttributes<HTMLInputElement>, "placeholder"> & { placeholder?: string | React.ReactNode }> = ({ placeholder, className, ...props }) => {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className="relative flex items-center">
      <input {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn("rounded-xl w-full outline-none shadow-sm focus-visible:border-foreground duration-100 transition border border-border bg-background-primary px-3 py-1 text-foreground-primary", className)} />
      <div className={cn("text-gray-400 left-3 absolute transition duration-100 pointer-events-none", !isFocused ? "opacity-100" : "opacity-0", value !== "" ? "hidden" : "block", className,)}>
        {placeholder}
      </div>
    </div>
  )
}
export const NumberInput: React.FC<Omit<React.InputHTMLAttributes<HTMLInputElement>, "placeholder"> & { placeholder?: string | React.ReactNode }> = ({ placeholder, className, ...props }) => {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className="relative flex items-center">
      <input {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        type="number"
        onBlur={() => setIsFocused(false)}
        className={cn("rounded-xl w-full outline-none shadow-sm focus-visible:border-foreground duration-100 transition border border-border bg-background-primary px-3 py-1 text-foreground-primary", className)} />
      <div className={cn("text-gray-400 left-3 absolute transition duration-100 pointer-events-none", !isFocused ? "opacity-100" : "opacity-0", value !== "" ? "hidden" : "block", className,)}>
        {placeholder}
      </div>
    </div>
  )
}
export const PasswordInput: React.FC<Omit<React.InputHTMLAttributes<HTMLInputElement>, "placeholder"> & { placeholder?: string | React.ReactNode }> = ({ placeholder, className, ...props }) => {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className="relative flex items-center">
      <input {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        type="password"
        onBlur={() => setIsFocused(false)}
        className={cn("rounded-xl w-full outline-none shadow-sm focus-visible:border-foreground duration-100 transition border border-border bg-background-primary px-3 py-1 text-foreground-primary", className)} />
      <div className={cn("text-gray-400 left-3 absolute transition duration-100 pointer-events-none", !isFocused ? "opacity-100" : "opacity-0", value !== "" ? "hidden" : "block", className,)}>
        {placeholder}
      </div>
    </div>
  )
}
export const InputStyles = "rounded-xl w-full outline-none shadow-sm focus-visible:border-foreground duration-100 transition border border-border bg-background-primary px-3 py-1 text-foreground-primary"