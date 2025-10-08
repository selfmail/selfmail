import {
    component$,
    useSignal,
    useStore,
    useVisibleTask$,
} from "@builder.io/qwik";
import {
    type DocumentHead,
    Form,
    routeAction$,
    useLocation,
    useNavigate,
    z,
    zod$,
} from "@builder.io/qwik-city";
import { init } from "@paralleldrive/cuid2";
import { LuInfo } from "@qwikest/icons/lucide";
import bcrypt from "bcrypt";
import { db } from "database";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";

export const useLogin = routeAction$(
    async ({ account: { email, password } }) => {
        const user = await db.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return {
                fieldErrors: {
                    "account.email": "No user found with this email",
                },
                failed: true,
            };
        }

        // compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return {
                fieldErrors: {
                    "account.password": "Incorrect password",
                },
                failed: true,
            };
        }

        // Verify email
        const createId = init({
            length: 32,
        });

        // TODO: add sending functionality

        // Set the session token as a cookie
        return {
            fieldErrors: {},
            failed: false,
        };
    },
    zod$({
        account: z.object({
            email: z.string().email("Invalid email address"),
            password: z.string().min(8, "Password must be at least 8 characters"),
        }),
    }),
);

export default component$(() => {
    const success = useSignal(false);
    const location = useLocation();
    const login = useLogin();

    const fieldErrors = useStore({
        email: "",
        password: "",
    });

    useVisibleTask$(async ({ track }) => {
        track(() => login.value?.fieldErrors);

        if (login.value?.failed) {
            const errors = login.value.fieldErrors as Record<string, string>;
            fieldErrors.email = errors["account.email"] || "";
            fieldErrors.password = errors["account.password"] || "";

            return;
        }
        if (login.value && !login.value.failed) {
            success.value = true;
        }
    });

    return (
        <div class="flex min-h-screen w-full items-center justify-center bg-neutral-50">
            <Form action={login} class="flex w-full max-w-md flex-col gap-4">
                {success.value && (
                    <div class="rounded-lg border border-green-200 bg-green-100 p-4">
                        <p class="text-green-800">
                            Verification email sent successfully. Please check your mail
                            provider.
                        </p>
                    </div>
                )}
                <h1 class="font-medium text-2xl">Resend Verification Email</h1>
                <p>
                    Please enter your email and password to resend a verification Email
                    for your account. We will send you a new email verification link and
                    invalidate the old one.
                </p>
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
                <span class="flex items-center space-x-2 text-neutral-500 text-sm">
                    <LuInfo class="inline-block h-4 w-4" />
                    <span>Please also take a look into the spam folder.</span>
                </span>
                <Button disabled={login.isRunning}>
                    {login.isRunning ? "Sending..." : "Send new Verification Email"}
                </Button>
            </Form>
        </div>
    );
});

export const head: DocumentHead = {
    title: "Regenerate a new Verification Token - Selfmail",
    meta: [
        {
            name: "description",
            content:
                "Regenerate a new verification token for your Selfmail Account. Selfmail is an open-source business email platform.",
        },
        // Open graph
        {
            property: "og:title",
            content: "Regenerate a new Verification Token - Selfmail",
        },
        {
            property: "og:description",
            content: "Regenerate a new verification token for your Selfmail Account.",
        },
    ],
};
