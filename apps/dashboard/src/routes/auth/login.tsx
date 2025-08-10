import {zodResolver} from "@hookform/resolvers/zod";
import {createFileRoute, Link} from "@tanstack/react-router";
import {useState} from "react";
import {useForm} from "react-hook-form";
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
import {z} from "zod";
import {client} from "@/lib/client";
import {InfoIcon} from "lucide-react";

export const Route = createFileRoute("/auth/login")({
    component: LoginComponent,
});

const schema = z.object({
    email: z.email(),
    password: z.string().min(8, "Password must be at least 8 characters long.").max(128, "Password must be at most 128 characters long.")
});

function LoginComponent() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const form = useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
        resolver: zodResolver(schema as any),
        defaultValues: {
            email: "",
            password: "",
        }
    });


    const handleSubmit = async (values: z.infer<typeof schema>) => {
        setIsLoading(true);
        setError("");

        try {
            const res = await client.v1.web.authentication.login.post({
                email: values.email,
                password: values.password,
            });

            if (res.status !== 200 || res.error) {
                setError("Invalid credentials. Please try again.");
                setIsLoading(false);
                return;
            }

            window.location.href = "/second-inbox";
        } catch {
            setError("Invalid credentials. Please try again.");
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
                        <h1 className={"font-bold text-2xl tracking-tight"}>Login</h1>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="Enter your email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Enter your password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        {error && (
                            <div className="text-center text-red-600 text-sm">{error}</div>
                        )}

                        <div className={"flex flex-row items-center space-x-2"}>
                            <InfoIcon className={"h-4 w-4 text-muted-foreground"}/>
                            <p className={"text-sm text-muted-foreground"}>
                                Forgot your password? <Link to={"/auth/reset-password"} className={"text-blue-500"}>Reset it here</Link>
                            </p>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
