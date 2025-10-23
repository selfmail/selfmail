import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

export const PREMIUM_PRODUCT_ID = process.env
	.STRIPE_PREMIUM_PRODUCT_ID as string;
