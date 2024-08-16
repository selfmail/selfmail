"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InputStyles } from "node_modules/ui/src/components/input";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "ui";
import { z } from "zod";
import { register as RegisterAction } from "./action";

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
export default function FormWithReactHookFormAndZodAndServer() {

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<TSignUpSchema>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: TSignUpSchema) => {
    const msg = await RegisterAction(data)
    if (msg) {
      setError("root", {
        type: "server",
        message: msg,
      });
      toast.error(msg);
      return
    }
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-2 lg:w-[400px]">

      <h2 className="text-xl">Register</h2>

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
      {
        errors.root?.type === "server" && (
          <p className="text-red-500">{`${errors.root.message}`}</p>
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
  );
}