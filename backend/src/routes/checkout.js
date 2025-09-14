import express from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });
const prisma = new PrismaClient();

router.post('/create-session', requireAuth, async (req, res) => {
  try {
    const { items, shipping, billing } = req.body; // items: [{id, title, priceCents, quantity, imageUrl}]
    if (!items?.length) return res.status(400).json({ error: 'No items' });

    const line_items = items.map(it => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: it.title,
          images: it.imageUrl ? [it.imageUrl] : undefined,
        },
        unit_amount: it.priceCents,
      },
      quantity: it.quantity,
    }));

    const totalCents = items.reduce((sum, it) => sum + it.priceCents * it.quantity, 0);

    // Create a pending order in DB (ties to user)
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalCents,
        status: 'PENDING',
        shippingName: shipping?.name ?? null,
        shippingAddr1: shipping?.address1 ?? null,
        shippingAddr2: shipping?.address2 ?? null,
        shippingCity: shipping?.city ?? null,
        shippingState: shipping?.state ?? null,
        shippingPostal: shipping?.postal ?? null,
        shippingCountry: shipping?.country ?? null,
        billingName: billing?.name ?? null,
        billingAddr1: billing?.address1 ?? null,
        billingAddr2: billing?.address2 ?? null,
        billingCity: billing?.city ?? null,
        billingState: billing?.state ?? null,
        billingPostal: billing?.postal ?? null,
        billingCountry: billing?.country ?? null,
        items: {
          create: items.map(it => ({
            productId: it.id,
            quantity: it.quantity,
            unitCents: it.priceCents,
          }))
        }
      }
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`,
      metadata: { orderId: String(order.id) },
    });

    // save session id to order
    await prisma.order.update({ where: { id: order.id }, data: { stripeSession: session.id } });

    res.json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Stripe error' });
  }
});

// Webhook (optional)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = (process.env.STRIPE_WEBHOOK_SECRET)
      ? new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' })
          .webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
      : JSON.parse(req.body);
  } catch (err) {
    console.log(err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = Number(session.metadata?.orderId);
    if (orderId) {
      await prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } });
    }
  }
  res.json({ received: true });
});

// Polling confirm endpoint (if you don't use webhooks)
router.get('/confirm/:sessionId', requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const order = await prisma.order.findFirst({ where: { stripeSession: sessionId, userId: req.user.id } });
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json({ status: order.status });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
