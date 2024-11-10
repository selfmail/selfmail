"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { InputStyles } from "node_modules/ui/src/components/input";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "ui";
import { z } from "zod";
import { registerUser } from "./action";

export const signUpSchema = z
    .object({
        email: z.string().email().endsWith("@selfmail.app", "Only selfmail adresses are allowed"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),
        confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })

export type TSignUpSchema = z.infer<typeof signUpSchema>;

export default function Register() {
    const [serverError, setServerError] = useState<string | undefined>(undefined)
    const { execute, result } = useAction(registerUser);

    useEffect(() => {
        if (result.serverError) {
            setServerError(result.serverError)
        }
    }, [result])

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<TSignUpSchema>({
        resolver: zodResolver(signUpSchema),
    });

    const onSubmit = async (data: TSignUpSchema) => {
        execute(data);

    };

    return (
        <div className="w-full h-screen flex items-center justify-center">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-2 w-full mx-5 sm:max-w-[350px] sm:mx-0  lg:max-w-[400px]">
                <h2 className="text-xl font-medium">Register</h2>

                <input
                    {...register("username")}
                    type="text"
                    placeholder="Username"
                    className={InputStyles}
                />
                {errors.username && (
                    <p className="text-red-500">{`${errors.username.message}`}</p>
                )}

                <input
                    {...register("email")}
                    type="email"
                    placeholder="Email"
                    className={InputStyles}
                />
                {errors.email && (
                    <p className="text-red-500">{`${errors.email.message}`}</p>
                )}

                <input
                    {...register("password")}
                    type="password"
                    placeholder="Password"
                    className={InputStyles}
                />
                {errors.password && (
                    <p className="text-red-500">{`${errors.password.message}`}</p>
                )}

                <input
                    {...register("confirmPassword")}
                    type="password"
                    placeholder="Repeat Password"
                    className={InputStyles}
                />
                {errors.confirmPassword && (
                    <p className="text-red-500">{`${errors.confirmPassword.message}`}</p>
                )}
                <Link href={"/login"} className="underline">Already have an account?</Link>
                {
                    serverError && (
                        <p className="text-red-500">{serverError}</p>
                    )
                }
                <div>
                    <Button
                        disabled={isSubmitting}
                        type="submit"
                    >
                        Submit
                    </Button>
                </div>
            </form>
        </div>
    );
}