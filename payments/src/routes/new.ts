import express from "express";
import { body } from "express-validator";
import {
	requireAuth,
	validateRequest,
	BadRequestError,
	NotFoundError,
	NotAuthorizedError,
} from "@kartikcse/common";
import { Order, OrderStatus } from "../models/order";
import { stripe } from "../stripe";
import { Payment } from "../models/payment";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";
import type { Request, Response } from "express";

const router = express.Router();

router.post(
	"/api/payments",
	requireAuth,
	[body("token").not().isEmpty(), body("orderId").not().isEmpty()],
	validateRequest,
	async (req: Request, res: Response) => {
		const { token, orderId } = req.body;

		const order = await Order.findById(orderId);
		if (!order) throw new NotFoundError();
		if (order.userId !== req.currentUser!.id) throw new NotAuthorizedError();
		if (order.status === OrderStatus.Cancelled)
			throw new BadRequestError("Cannot pay for a cancelled order");

		const charge = await stripe.charges.create({
			currency: "usd",
			amount: order.price * 100,
			source: token,
			description: `Charge for Order ID: ${order.id}`,
			shipping: {
				name: order.userId,
				address: {
					city: "South San Francisco",
					country: "US",
					line1: "354 Oyster Point Blvd",
					postal_code: "94080",
					state: "CA",
				},
			},
		});

		const payment = Payment.build({
			orderId,
			stripeId: charge.id,
		});
		await payment.save();

		await new PaymentCreatedPublisher(natsWrapper.client).publish({
			id: payment.id,
			orderId: payment.orderId,
			stripeId: payment.stripeId,
		});

		res.status(201).send({ id: payment.id });
	}
);

export { router as createChargeRouter };
