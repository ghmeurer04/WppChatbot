const cb = require("./chatbot.js");
const express = require('express');
const Stripe = require("stripe");
const app = express();

// Replace this endpoint secret with your unique endpoint secret key
// If you're testing with the CLI, run 'stripe listen' to find the secret key
// If you defined your endpoint using the API or the Dashboard, check your webhook settings for your endpoint secret: https://dashboard.stripe.com/webhooks
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.WEBHOOK_SECRET_KEY

// The express.raw middleware keeps the request body unparsed;
// this is necessary for the signature verification process
app.post('/stripe/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  let event;
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }

  // Handle the event
  switch (event.type) {
    case 'invoice.payment_succeeded':
      const payment = event.data.object;
      console.log(payment.customer_phone,payment.customer_name,payment.customer_email)
      await cb.addNewUser(payment.customer_phone,payment.customer_name,payment.customer_email)
      break;
    default:
      console.log(event.type)
      
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
}});

app.listen(3000, () => console.log('Running on port 3000'));