import express from "express";
import { NotFoundError } from "@kartikcse/common";
import { Ticket } from "../models/ticket";
import type { Request, Response } from "express";

const router = express.Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
	const ticket = await Ticket.findById(req.params.id);

	if (!ticket) throw new NotFoundError();

	res.send(ticket);
});

export { router as showTicketRouter };
