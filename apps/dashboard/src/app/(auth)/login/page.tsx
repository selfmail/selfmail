"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { InputStyles } from "node_modules/ui/src/components/input";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "ui";
import { z } from "zod";
import { loginUser } from "./action";

export const signInSchema = z
    .object({
        email: z.string().email().endsWith("@selfmail.app", "Only @selfmail.app adresses are allowed"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),
    })

export type SignInSchema = z.infer<typeof signInSchema>;


export default function Login() {
    const [serverError, setServerError] = useState<string | undefined>(undefined)

    const { execute, result } = useAction(loginUser);

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
    } = useForm<SignInSchema>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = (data: SignInSchema) => {
        execute(data);
        reset()
    };

    return (
        // h-[100dvh]
        <div className="w-full h-screen flex items-center justify-center">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-2 w-full mx-5 sm:max-w-[350px] sm:mx-0  lg:max-w-[400px]">
                <h2 className="text-xl font-medium">Login</h2>
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
                <Link href={"/register"} className="underline">Don't have an account?</Link>
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
            </form >
        </div>
    );
}