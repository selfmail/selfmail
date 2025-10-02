import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { type DocumentHead, Form, routeAction$, z, zod$ } from "@builder.io/qwik-city";
import { LuInfo } from "@qwikest/icons/lucide";
import { db } from "database";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import bcrypt from "bcrypt";

export const useRegister = routeAction$(
    async ({ account: { confirmPassword, email, password, name } }) => {
        if (password !== confirmPassword) {
            return {
                fieldErrors: {
                    'account.confirmPassword': 'Passwords do not match'
                },
                failed: true
            }
        }

        const userAlreadyExists = await db.user.findUnique({
            where: {
                email
            }
        })

        if (userAlreadyExists) {
            return {
                fieldErrors: {
                    'account.email': 'A user with this email already exists'
                },
                failed: true
            }
        }

        // Hash the password with bcrypt using 12 salt rounds for security
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await db.user.create({
            data: {
                email,
                name,
                password: hashedPassword
            }
        })

        if (!user) {
            return {
                fieldErrors: {
                    'account.email': 'Something went wrong, please try again later'
                },
                failed: true
            }
        }

        return {
            fieldErrors: {},
            failed: false
        }
    },
    zod$({
        account: z.object({
            name: z.string().min(2, "Name must be at least 2 characters"),
            email: z.string().email("Invalid email address"),
            password: z.string().min(8, "Password must be at least 8 characters"),
            confirmPassword: z.string().min(8, "Confirm Password must be at least 8 characters"),
        }).refine((data) => data.password === data.confirmPassword, {
            path: ["confirmPassword"],
            message: "Passwords do not match",
        })
    }))

export default component$(() => {
    const register = useRegister();

    const fieldErrors = useStore({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    })

    useVisibleTask$(({ track }) => {
        track(() => register.value?.fieldErrors)

        if (register.value?.failed) {
            const errors = register.value.fieldErrors as Record<string, string>;
            fieldErrors.name = errors['account.name'] || ""
            fieldErrors.email = errors['account.email'] || ""
            fieldErrors.password = errors['account.password'] || ""
            fieldErrors.confirmPassword = errors['account.confirmPassword'] || ""
        } else {
            console.log("Success!")
        }
    })


    return (
        <div class="flex min-h-screen w-full items-center justify-center bg-neutral-50">
            <Form action={register} class="flex w-full max-w-md flex-col gap-4">
                <h1 class="font-medium text-2xl">Register</h1>
                <Input class="bg-neutral-200" placeholder="Name" name="account.name" required />
                {fieldErrors.name && <p class="text-red-500">{fieldErrors.name}</p>}
                <Input class="bg-neutral-200" placeholder="Email" name="account.email" type="email" required />
                {fieldErrors.email && <p class="text-red-500">{fieldErrors.email}</p>}
                <Input class="bg-neutral-200" placeholder="Password" name="account.password" type="password" required />
                {fieldErrors.password && <p class="text-red-500">{fieldErrors.password}</p>}
                <Input class="bg-neutral-200" placeholder="Confirm Password" name="account.confirmPassword" type="password" required />
                {fieldErrors.confirmPassword && <p class="text-red-500">{fieldErrors.confirmPassword}</p>}
                <Button disabled={register.isRunning}>{register.isRunning ? "Registering..." : "Register"}</Button>
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
            </Form>
        </div>
    );
});

export const head: DocumentHead = {
    title: "Register - Selfmail",
};
