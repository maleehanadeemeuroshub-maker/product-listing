import Stripe from "stripe";

// Instantiate a single client instance — never the deprecated
// `stripe.api_key = ...` global-assignment pattern.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
