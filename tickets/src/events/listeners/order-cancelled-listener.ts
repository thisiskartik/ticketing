import { Listener, Subjects } from "@kartikcse/common";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import type { Message } from "node-nats-streaming";
import type { OrderCancelledEvent } from "@kartikcse/common";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
		const ticket = await Ticket.findById(data.ticket.id);
		if (!ticket) throw new Error("Ticket not found");

		ticket.set({ orderId: undefined });
		await ticket.save();

		await new TicketUpdatedPublisher(this.client).publish({
			id: ticket.id,
			version: ticket.version,
			userId: ticket.userId,
			title: ticket.title,
			price: ticket.price,
			orderId: ticket.orderId,
		});

		msg.ack();
	}
}
