import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import {
    type DocumentHead,
    Form,
    Link,
    routeAction$,
    routeLoader$,
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
import { middlewareAuthentication } from "~/lib/auth";

export const useLogin = routeAction$(
    async ({ account: { email, password } }, { cookie, redirect }) => {
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

        if (!user.emailVerified) {
            return {
                verificationError: true,
                failed: true,
            };
        }

        // Create a new session token
        const createId = init({
            length: 32,
        });

        const sessionToken = createId();

        // Store the session token in the database
        const session = await db.session.create({
            data: {
                userId: user.id,
                token: sessionToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Session valid for 7 days
            },
        });

        if (!session) {
            return {
                fieldErrors: {
                    "account.email": "Something went wrong, please try again later",
                },
                failed: true,
            };
        }

        cookie.set("selfmail-session-token", sessionToken, {
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "Lax",
        });

        // Check for an open invitation
        const invitation = await db.invitation.findFirst({
            where: {
                userId: user.id,
            },
        });

        if (invitation) {
            throw redirect(307, `/workspace/members/join?token=${invitation.token}`);
        }

        return {
            fieldErrors: {},
            failed: false,
            success: true,
            hasWorkspace: !!(await db.member.findFirst({
                where: {
                    userId: user.id,
                },
            })),
        };
    },
    zod$({
        account: z.object({
            email: z.string().email("Invalid email address"),
            password: z.string().min(8, "Password must be at least 8 characters"),
        }),
    }),
);

const useAlreadyLoggedIn = routeLoader$(async ({ cookie }) => {
    const sessionToken = cookie.get("selfmail-session-token")?.value;

    if (!sessionToken) {
        return { isLoggedIn: false, user: null };
    }

    const { authenticated, user } = await middlewareAuthentication(sessionToken);
    if (!authenticated || !user) {
        return { isLoggedIn: false, user: null };
    }
    return {
        isLoggedIn: true,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
    };
});

export default component$(() => {
    const location = useLocation();
    const navigation = useNavigate();
    const login = useLogin();
    const user = useAlreadyLoggedIn()

    const fieldErrors = useStore({
        email: "",
        password: "",
    });

    const invitationToken = `?invitationToken=${location.url.searchParams.get(
        "invitationToken",
    ) || ""}`;

    useVisibleTask$(async ({ track }) => {
        track(() => login.value?.fieldErrors);

        if (login.value?.failed) {
            const errors = login.value.fieldErrors as Record<string, string>;
            fieldErrors.email = errors["account.email"] || "";
            fieldErrors.password = errors["account.password"] || "";

            return;
        }
        if (login.value?.success) {
            if (!login.value.hasWorkspace) {
                throw await navigation("/create");
            }
            throw await navigation("/");
        }
    });

    return (
        <div class="flex min-h-screen w-full items-center justify-center bg-neutral-50">
            <Form action={login} class="flex w-full max-w-md flex-col gap-4">
                {location.url.searchParams.get("success") && (
                    <div class="rounded-lg border border-green-200 bg-green-100 p-4">
                        <p class="text-green-800">
                            {location.url.searchParams.get("success")}
                        </p>
                    </div>
                )}
                {location.url.searchParams.get("error") && (
                    <div class="rounded-lg border border-red-200 bg-red-100 p-4">
                        <p class="text-red-800">{location.url.searchParams.get("error")}</p>
                    </div>
                )}
                {user.value.user && user.value.isLoggedIn && (
                    <Link href="/" class="rounded-lg border border-neutral-200 bg-neutral-100 p-4">
                        <p class="text-neutral-800">
                            Welcome back, {user.value.user.name}! You are already logged in. Click here to go to your dashboard.
                        </p>
                    </Link>
                )}
                <h1 class="font-medium text-2xl">Login</h1>
                <Input
                    class="bg-neutral-200"
                    placeholder="Email"
                    name="account.email"
                    type="email"
                    required
                />
                {fieldErrors.email && <p class="text-red-700">{fieldErrors.email}</p>}
                <Input
                    class="bg-neutral-200"
                    placeholder="Password"
                    name="account.password"
                    type="password"
                    required
                />
                {fieldErrors.password && (
                    <p class="text-red-700">{fieldErrors.password}</p>
                )}
                {login.value?.verificationError && (
                    <div class="rounded-lg border border-red-200 bg-red-100 p-4">
                        <p class="text-red-800">
                            Please verify your email before logging in. If you didn't receive
                            the email, please check your spam folder. You can generate a new
                            one{" "}
                            <Link
                                class="cursor-pointer underline"
                                href="/auth/resend-verification"
                            >
                                here
                            </Link>
                            .
                        </p>
                    </div>
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
                <Button disabled={login.isRunning}>
                    {login.isRunning ? "Logging in..." : "Login"}
                </Button>
                <span class="text-neutral-500 text-sm">
                    Don't have an account?{" "}
                    <a href={`/auth/register${invitationToken}`} class="underline">
                        Sign up
                    </a>
                </span>
            </Form>
        </div>
    );
});

export const head: DocumentHead = {
    title: "Login - Selfmail",
    meta: [
        {
            name: "description",
            content:
                "Log in to your Selfmail Account. Selfmail is an open-source business email platform.",
        },
        // Open graph
        {
            property: "og:title",
            content: "Login - Selfmail",
        },
        {
            property: "og:description",
            content: "Log in to your Selfmail Account.",
        },
    ],
};
