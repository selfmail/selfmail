import { component$ } from "@builder.io/qwik";
import { type DocumentHead, Form } from "@builder.io/qwik-city";
import { Button } from "~/components/Button";
import { LuInfo } from "@qwikest/icons/lucide"

export default component$(() => {
    return (
        <div class="flex min-h-screen w-full items-center justify-center bg-neutral-50">
            <Form class="flex w-full max-w-md flex-col gap-4">
                <h1 class="font-medium text-2xl">Register</h1>
                <Button>Register</Button>
                <span class="text-sm flex items-center text-neutral-500 space-x-2">
                    <LuInfo class="inline-block h-4 w-4" />
                    <span>
                        You agree to our <a href="https://selfmail.app/terms" class="underline">Terms of Service</a> and <a href="https://selfmail.app/privacy" class="underline">Privacy Policy</a>.
                    </span>
                </span>
            </Form>
        </div>
    );
});

export const head: DocumentHead = {
    title: "Register - Selfmail",
};
