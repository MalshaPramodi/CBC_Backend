import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  const { cart, total } = req.body;

  if (!cart || !total) {
    return res.status(400).json({ error: "Cart and total are required." });
  }

  const line_items = cart.map((item) => ({
    price_data: {
      currency: "lkr",
      product_data: {
        name: item.productName,
        images: item.images?.length > 0 ? [item.images[0]] : [],
      },
      unit_amount: Math.round(item.lastPrice * 100), // Convert to cents
    },
    quantity: item.qty,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `http://localhost:5173/orders?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/cart`,
    });

    // Send the session URL to the frontend
    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    res.status(500).json({ error: "Failed to create checkout session." });
  }
};
