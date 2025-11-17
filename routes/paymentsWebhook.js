// import express from "express";
// import Stripe from "stripe";
// import bodyParser from "body-parser";
// import { createOrderFromWebhook } from "../controllers/paymentController.js";

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// router.post(
//   "/webhook",
//   bodyParser.raw({ type: "application/json" }),
//   async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET
//       );
//     } catch (err) {
//       console.error("Webhook signature verification failed.", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     // Handle checkout session completed
//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;

//       try {
//         await createOrderFromWebhook(session); // Create order in DB
//         console.log("Order created from webhook:", session.id);
//       } catch (error) {
//         console.error("Failed to create order from webhook:", error.message);
//         return res.status(500).send("Internal Server Error");
//       }
//     }

//     res.json({ received: true });
//   }
// );

// export default router;
