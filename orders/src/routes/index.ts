import express from "express";
import { requireAuth } from "@kartikcse/common";
import { Order } from "../models/order";
import type { Request, Response } from "express";

const router = express.Router();

router.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
	const orders = await Order.find({
		userId: req.currentUser!.id,
	}).populate("ticket");

	res.send(orders);
});

export { router as indexOrderRouter };
