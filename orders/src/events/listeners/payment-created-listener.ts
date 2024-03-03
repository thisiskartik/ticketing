import { Subjects, Listener, OrderStatus } from "@kartikcse/common";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";
import type { Message } from "node-nats-streaming";
import type { PaymentCreatedEvent } from "@kartikcse/common";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
		const order = await Order.findById(data.orderId);
		if (!order) throw new Error("Order not found");

		order.set({
			status: OrderStatus.Complete,
		});
		await order.save();

		msg.ack();
	}
}
