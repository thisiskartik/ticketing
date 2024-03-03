import { Listener, Subjects } from "@kartikcse/common";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";
import type { Message } from "node-nats-streaming";
import type { OrderCreatedEvent } from "@kartikcse/common";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
		const order = Order.build({
			id: data.id,
			version: data.version,
			status: data.status,
			userId: data.userId,
			price: data.ticket.price,
		});
		await order.save();

		msg.ack();
	}
}
