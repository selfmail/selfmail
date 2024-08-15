"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button, Input } from "ui";
import { z } from "zod";
import { login } from "./action";

export const loginSchema = z
  .object({
    email: z.string().email("Invalid email").endsWith("@selfmail.app", "Only selfmail adresses are allowed"),
    password: z.string().min(10, "Password must be at least 10 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    confirmPassword: z.string().min(10, "Password must be at least 10 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type TSLoginSchema = z.infer<typeof loginSchema>;

export default function FormWithReactHookFormAndZodAndServer() {

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<TSLoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: TSLoginSchema) => {
    const msg = await login(data)

    if (msg) {
      setError("email", {
        type: "server",
        message: msg,
      });
      toast.error(msg);
      return
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-2 w-[500px]">
      <Input
        {...register("username")}
        type="text"
        placeholder="Username"
      />
      {errors.username && (
        <p className="text-red-500">{`${errors.username.message}`}</p>
      )}
      <Input
        {...register("email")}
        type="email"
        placeholder="Email"
      />
      {errors.email && (
        <p className="text-red-500">{`${errors.email.message}`}</p>
      )}

      <Input
        {...register("password")}
        type="password"
        placeholder="Password"
      />
      {errors.password && (
        <p className="text-red-500">{`${errors.password.message}`}</p>
      )}

      <Input
        {...register("confirmPassword")}
        type="password"
        placeholder="Confirm password"
      />
      {errors.confirmPassword && (
        <p className="text-red-500">{`${errors.confirmPassword.message}`}</p>
      )}

      <div>
        <Button
          disabled={isSubmitting}
          type="submit"
        >
          Submit
        </Button>
      </div>
    </form>
  );
}