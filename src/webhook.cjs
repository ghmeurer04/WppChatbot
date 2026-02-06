const express = require('express');
const Stripe = require('stripe');

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const endpointSecret = process.env.WEBHOOK_SECRET_KEY;
const port = Number(process.env.PORT || 3000);

function getCustomerDataFromEvent(event) {
  const object = event?.data?.object || {};
  const metadata = object.metadata || {};

  const customerPhone = metadata.customer_phone || metadata.phone || object.customer_phone;
  const customerName = metadata.customer_name || metadata.name || object.customer_name;
  const customerEmail = metadata.customer_email || metadata.email || object.customer_email || object.customer_details?.email;

  return { customerPhone, customerName, customerEmail };
}

async function getAddNewUser() {
  const chatbotModule = await import('./chatbot.js');

  if (typeof chatbotModule.addNewUser !== 'function') {
    throw new Error('addNewUser export not found in chatbot.js');
  }

  return chatbotModule.addNewUser;
}

function parseUnverifiedEvent(rawBody) {
  try {
    const payload = rawBody instanceof Buffer ? rawBody.toString('utf8') : String(rawBody || '');
    return JSON.parse(payload);
  } catch (error) {
    throw new Error(`Invalid JSON payload: ${error.message}`);
  }
}

app.get('/stripe/webhook/health', (_request, response) => {
  return response.status(200).json({ ok: true, endpoint: '/stripe/webhook' });
});

app.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
  let event;

  try {
    if (endpointSecret) {
      const signature = request.headers['stripe-signature'];
      event = stripe.webhooks.constructEvent(request.body, signature, endpointSecret);
    } else {
      event = parseUnverifiedEvent(request.body);
    }
  } catch (err) {
    console.log('⚠️ Stripe webhook could not be validated/parsed.', err.message);
    return response.sendStatus(400);
  }

  try {
    console.log('ℹ️ Stripe event received:', event.type);

    switch (event.type) {
      case 'invoice.payment_succeeded':
      case 'checkout.session.completed': {
        const payment = getCustomerDataFromEvent(event);

        if (!payment.customerPhone || !payment.customerName || !payment.customerEmail) {
          console.log('⚠️ Missing required customer metadata.', payment);
          break;
        }

        const addNewUser = await getAddNewUser();
        await addNewUser(payment.customerPhone, payment.customerName, payment.customerEmail);
        console.log('✅ Customer released after Stripe payment:', payment.customerPhone);
        break;
      }
      default:
        console.log('ℹ️ Stripe event ignored by webhook:', event.type);
    }

    return response.json({ received: true });
  } catch (error) {
    console.log('❌ Error while processing Stripe event:', error.message);
    return response.status(500).json({ error: 'Webhook processing failed' });
  }
});

app.listen(port, () => console.log(`Running Stripe webhook on port ${port}`));
