import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import {
    type DocumentHead,
    Form,
    routeAction$,
    routeLoader$,
    useNavigate,
    z,
    zod$,
} from "@builder.io/qwik-city";
import { init } from "@paralleldrive/cuid2";
import { LuInfo } from "@qwikest/icons/lucide";
import bcrypt from "bcrypt";
import { db } from "database";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";

const useCookies = routeLoader$(async ({ cookie }) => {
    console.log("cookies", cookie.has("session"));
});

export const useRegister = routeAction$(
    async ({ account: { confirmPassword, email, password, name } }) => {
        if (password !== confirmPassword) {
            return {
                fieldErrors: {
                    "account.confirmPassword": "Passwords do not match",
                },
                failed: true,
            };
        }

        const userAlreadyExists = await db.user.findUnique({
            where: {
                email,
            },
        });

        if (userAlreadyExists) {
            return {
                fieldErrors: {
                    "account.email": "A user with this email already exists",
                },
                failed: true,
            };
        }

        // Hash the password with bcrypt using 12 salt rounds for security
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await db.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        });

        if (!user) {
            return {
                fieldErrors: {
                    "account.email": "Something went wrong, please try again later",
                },
                failed: true,
            };
        }

        const createId = init({
            length: 32,
        });

        const verification = await db.emailVerification.create({
            data: {
                token: createId(),
                expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour
                userId: user.id,
                email,
            },
        });

        if (!verification) {
            return {
                fieldErrors: {
                    "account.email":
                        "Something went wrong, please try again later or contact support",
                },
                failed: true,
            };
        }

        // TODO: send verification email

        return {
            fieldErrors: {},
            failed: false,
        };
    },
    zod$({
        account: z
            .object({
                name: z.string().min(2, "Name must be at least 2 characters"),
                email: z.string().email("Invalid email address"),
                password: z.string().min(8, "Password must be at least 8 characters"),
                confirmPassword: z
                    .string()
                    .min(8, "Confirm Password must be at least 8 characters"),
            })
            .refine((data) => data.password === data.confirmPassword, {
                path: ["confirmPassword"],
                message: "Passwords do not match",
            }),
    }),
);

export default component$(() => {
    const navigation = useNavigate();
    const register = useRegister();

    console.log("cookies", useCookies() || "hello");

    const fieldErrors = useStore({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    useVisibleTask$(async ({ track }) => {
        track(() => register.value?.fieldErrors);

        if (register.value?.failed) {
            const errors = register.value.fieldErrors as Record<string, string>;
            fieldErrors.name = errors["account.name"] || "";
            fieldErrors.email = errors["account.email"] || "";
            fieldErrors.password = errors["account.password"] || "";
            fieldErrors.confirmPassword = errors["account.confirmPassword"] || "";
        } else if (
            !register.value?.failed &&
            register.formData?.keys().next().done
        ) {
            throw await navigation(
                "/auth/login?success=Account%20created%20successfully.%20Please%20check%20your%20email%20to%20verify%20your%20account",
            );
        }
    });

    return (
        <div class="flex min-h-screen w-full items-center justify-center bg-neutral-50">
            <Form action={register} class="flex w-full max-w-md flex-col gap-4">
                <h1 class="font-medium text-2xl">Register</h1>
                <Input
                    class="bg-neutral-200"
                    placeholder="Name"
                    name="account.name"
                    required
                />
                {fieldErrors.name && <p class="text-red-500">{fieldErrors.name}</p>}
                <Input
                    class="bg-neutral-200"
                    placeholder="Email"
                    name="account.email"
                    type="email"
                    required
                />
                {fieldErrors.email && <p class="text-red-500">{fieldErrors.email}</p>}
                <Input
                    class="bg-neutral-200"
                    placeholder="Password"
                    name="account.password"
                    type="password"
                    required
                />
                {fieldErrors.password && (
                    <p class="text-red-500">{fieldErrors.password}</p>
                )}
                <Input
                    class="bg-neutral-200"
                    placeholder="Confirm Password"
                    name="account.confirmPassword"
                    type="password"
                    required
                />
                {fieldErrors.confirmPassword && (
                    <p class="text-red-500">{fieldErrors.confirmPassword}</p>
                )}
                <span class="flex items-center space-x-2 text-neutral-500 text-sm">
                    <LuInfo class="inline-block h-4 w-4" />
                    <span>
                        You agree to our{" "}
                        <a href="https://selfmail.app/terms" class="underline">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="https://selfmail.app/privacy" class="underline">
                            Privacy Policy
                        </a>
                        .
                    </span>
                </span>
                <Button disabled={register.isRunning}>
                    {register.isRunning ? "Registering..." : "Register"}
                </Button>
                <span class="text-neutral-500 text-sm">
                    Already have an account?{" "}
                    <a href="/auth/login" class="underline">
                        Login
                    </a>
                </span>
            </Form>
        </div>
    );
});

export const head: DocumentHead = {
    title: "Register - Selfmail",
    meta: [
        {
            name: "description",
            content:
                "Create a new Selfmail Account. Selfmail is an open-source business email platform.",
        },
        // Open graph
        {
            property: "og:title",
            content: "Register - Selfmail",
        },
        {
            property: "og:description",
            content: "Create a new Selfmail Account.",
        },
    ],
};
