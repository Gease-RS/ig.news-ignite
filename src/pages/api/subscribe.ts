import { stripe } from "./../../services/stripe";
import { getSession } from "next-auth/react";
import { NextApiRequest, NextApiResponse } from "next";

export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === "POST") {
    const { user } = await getSession({ req: request });
    const { email } = user;
    console.log(user);

    const stripeCustomer = await stripe.customers.create({
      email,
    });

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer_email: stripeCustomer.email,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [
        {
          price: "price_1K23N6BpL5jcAru1yXHBDoxV",
          quantity: 1,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    return response.status(200).json({ sessionId: stripeCheckoutSession.id });
  } else {
    response.setHeader("Allow", "POST");
    response.status(405).json({ message: "Method not allowed" });
  }
};
