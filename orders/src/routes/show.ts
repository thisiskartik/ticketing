import express from "express";
import { requireAuth, NotFoundError, NotAuthorizedError } from "@kartikcse/common";
import { Order } from "../models/order";
import type { Request, Response } from "express";

const router = express.Router();

router.get("/api/orders/:orderId", requireAuth, async (req: Request, res: Response) => {
	const order = await Order.findById(req.params.orderId).populate("ticket");

	if (!order) throw new NotFoundError();
	if (order.userId !== req.currentUser!.id) throw new NotAuthorizedError();

	res.send(order);
});

export { router as showOrderRouter };
