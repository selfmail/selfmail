import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
} from "ui";
import { z } from "zod";
import { client } from "@/lib/client";

export const Route = createFileRoute("/auth/register")({
	component: RegisterComponent,
});

const schema = z.object({
	email: z.email(),
	name: z
		.string()
		.min(1, "Name is required")
		.max(50, "Name must be at most 50 characters long."),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters long.")
		.max(128, "Password must be at most 128 characters long."),
    passwordVerification: z
        .string()
});


function RegisterComponent() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
            password: "",
            name: "",
            passwordVerification: ""
        },
    });

	const handleSubmit = async (values: z.infer<typeof schema>) => {
		setIsLoading(true);
		setError("");

        if (values.password !== values.passwordVerification) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

		try {
			const res = await client.v1.web.authentication.register.post({
				email: values.email,
				password: values.password,
				name: values.name,
			});

			if (res.status !== 200 || res.error) {
				setError(
					res.data?.message ??
						"An error occurred during register. Your email may already be registered.",
				);
				setIsLoading(false);
				return;
			}

			window.location.href = "/second-inbox";
		} catch {
			setError(".");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<div className="w-full max-w-md space-y-4">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4 px-5 md:px-0"
					>
						<h1 className={"font-bold text-2xl tracking-tight"}>Register</h1>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Enter your name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="Enter your email"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="Enter your password"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
                        <FormField
                            control={form.control}
                            name="passwordVerification"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Enter your password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
						{error && (
							<div className="text-center text-red-600 text-sm">{error}</div>
						)}
						<Button onClick={() => console.log("pressed")} type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Logging in..." : "Login"}
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}
