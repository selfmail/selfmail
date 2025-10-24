import { component$ } from "@builder.io/qwik";
import {
    Link,
    routeLoader$,
    server$,
    useNavigate,
} from "@builder.io/qwik-city";
import { db } from "database";
import { toast } from "qwik-sonner";
import BackHeading from "~/components/ui/BackHeading";
import { Button } from "~/components/ui/Button";
import { PREMIUM_PRODUCT_ID, stripe } from "~/lib/billing";
import { permissions } from "~/lib/permissions";
import type { MemberInSharedMap, WorkspaceInSharedMap } from "../types";

const useBilling = routeLoader$(async ({ sharedMap, error }) => {
    const workspace = sharedMap.get("workspace") as WorkspaceInSharedMap;
    const member = sharedMap.get("member") as MemberInSharedMap;

    const memberPermissions = await permissions({
        memberId: member.id,
        workspaceId: workspace.id,
        permissions: ["payments:read", "payments:update", "payments:delete"],
    });

    if (!memberPermissions.includes("payments:read")) {
        throw error(403, "You do not have permission to view billing information.");
    }

    const billingInfo = await db.plan.findUnique({
        where: {
            id: workspace.planId,
        },
        select: {
            name: true,
            description: true,
            maxSeats: true,
            baseSeats: true,
            storageBytesPerSeat: true,
            domainsPerSeat: true,
            addressesPerSeat: true,
            stripeProductId: true,
        },
    });

    if (!billingInfo) {
        throw error(404, "Contact us. Plan not found.");
    }

    // For now, we'll determine if it's upgradeable based on whether it has a Stripe product ID
    // You might want to adjust this logic based on your business rules
    const canUpgrade = !billingInfo.stripeProductId;

    return {
        plan: billingInfo,
        canUpgrade,
    };
});

const checkout = server$(async function () {
    try {
        const YOUR_DOMAIN = this.env.get("BASE_URL") || "http://localhost:5173";
        const prices = await stripe.prices.list({
            product: PREMIUM_PRODUCT_ID,
            expand: ["data.product"],
        });

        if (!prices.data || prices.data.length === 0) {
            throw new Error("No pricing found for 'pro' lookup key");
        }

        const session = await stripe.checkout.sessions.create({
            billing_address_collection: "auto",
            line_items: [
                {
                    price: prices.data[0].id,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${YOUR_DOMAIN}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${YOUR_DOMAIN}?canceled=true`,
            automatic_tax: { enabled: true },
        });

        return { url: session.url, error: null };
    } catch (error) {
        console.error("Checkout error:", error);
        return {
            url: null,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
});

const formatBytes = (bytes: number | bigint) => {
    const numBytes = typeof bytes === "bigint" ? Number(bytes) : bytes;
    if (numBytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    return Number.parseFloat((numBytes / k ** i).toFixed(2)) + " " + sizes[i];
};

export default component$(() => {
    const billing = useBilling();
    const navigate = useNavigate();

    if (!billing.value) {
        return (
            <div class="p-6">
                <h1 class="mb-4 font-bold text-2xl text-gray-900">
                    Billing Information
                </h1>
                <p class="text-gray-500">No billing information available.</p>
            </div>
        );
    }

    const plan = billing.value;

    return (
        <>
            <div class="flex flex-col space-y-3">
                <BackHeading>Billing Information</BackHeading>
                <p class="text-gray-600">
                    Manage your current plan and billing details
                </p>
            </div>

            {/* Current Plan Card */}
            <div class="rounded-lg border border-neutral-200 bg-white p-4">
                <div class="p-6">
                    <div class="mb-4 flex items-center justify-between">
                        <h2 class="font-semibold text-gray-900 text-xl uppercase">
                            {plan.plan.name}
                        </h2>
                        <span class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800 text-sm">
                            Current Plan
                        </span>
                    </div>

                    {plan.plan.description && (
                        <p class="mb-6 text-gray-600">{plan.plan.description}</p>
                    )}

                    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div class="rounded-lg bg-gray-50 p-4">
                            <div class="mb-1 font-medium text-gray-500 text-sm">Price</div>
                            <div class="font-semibold text-gray-900 text-lg">
                                {plan.plan.stripeProductId ? "Contact us for pricing" : "Free"}/month
                            </div>
                        </div>

                        <div class="rounded-lg bg-gray-50 p-4">
                            <div class="mb-1 font-medium text-gray-500 text-sm">
                                Domains per Seat
                            </div>
                            <div class="font-semibold text-gray-900 text-lg">
                                {plan.plan.domainsPerSeat}
                            </div>
                        </div>

                        <div class="rounded-lg bg-gray-50 p-4">
                            <div class="mb-1 font-medium text-gray-500 text-sm">
                                Addresses per Seat
                            </div>
                            <div class="font-semibold text-gray-900 text-lg">
                                {plan.plan.addressesPerSeat}
                            </div>
                        </div>

                        <div class="rounded-lg bg-gray-50 p-4">
                            <div class="mb-1 font-medium text-gray-500 text-sm">
                                Max Seats
                            </div>
                            <div class="font-semibold text-gray-900 text-lg">
                                {plan.plan.maxSeats ?? "Unlimited"}
                            </div>
                        </div>

                        <div class="rounded-lg bg-gray-50 p-4">
                            <div class="mb-1 font-medium text-gray-500 text-sm">Storage per Seat</div>
                            <div class="font-semibold text-gray-900 text-lg">
                                {formatBytes(plan.plan.storageBytesPerSeat)}
                            </div>
                        </div>

                        <div class="rounded-lg bg-gray-50 p-4">
                            <div class="mb-1 font-medium text-gray-500 text-sm">
                                Base Seats
                            </div>
                            <div class="font-semibold text-gray-900 text-lg">
                                {plan.plan.baseSeats}
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-3">
                        {(billing.value.canUpgrade && (
                            <Button
                                type="button"
                                class="inline-block cursor-pointer rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                                onClick$={async () => {
                                    const { url, error: checkoutError } = await checkout();
                                    if (checkoutError || !url) {
                                        toast.error("Failed to create checkout session");
                                        return;
                                    }
                                    navigate(url);
                                }}
                            >
                                Upgrade Plan
                            </Button>
                        )) || (
                                <Link
                                    href="mailto:support@selfmail.app"
                                    class="inline-block rounded bg-gray-200 px-4 py-2 font-medium text-gray-600"
                                >
                                    You are on the highest plan. Contact us for custom plans.
                                </Link>
                            )}
                    </div>
                </div>
            </div>
        </>
    );
});
