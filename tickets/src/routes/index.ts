import express from "express";
import { Ticket } from "../models/ticket";
import type { Request, Response } from "express";

const router = express.Router();

router.get("/api/tickets", async (req: Request, res: Response) => {
	const tickets = await Ticket.find({ orderId: undefined });
	res.send(tickets);
});

export { router as indexTicketRouter };
