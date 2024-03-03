import { Listener } from "@kartikcse/common";
import { Subjects } from "@kartikcse/common";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import type { Message } from "node-nats-streaming";
import type { OrderCreatedEvent } from "@kartikcse/common";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
		const ticket = await Ticket.findById(data.ticket.id);
		if (!ticket) throw new Error("Ticket not found");

		ticket.set({ orderId: data.id });
		await ticket.save();

		await new TicketUpdatedPublisher(this.client).publish({
			id: ticket.id,
			version: ticket.version,
			price: ticket.price,
			title: ticket.title,
			userId: ticket.userId,
			orderId: ticket.orderId,
		});

		msg.ack();
	}
}
