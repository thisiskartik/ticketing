import mongoose from "mongoose";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Order, OrderStatus } from "../../../models/order";
import type { Message } from "node-nats-streaming";
import type { OrderCreatedEvent } from "@kartikcse/common";

const setup = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client);

	const data: OrderCreatedEvent["data"] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		expiresAt: "sampleexpiredat",
		userId: "sampleuserid",
		status: OrderStatus.Created,
		ticket: {
			id: "sampleticketid",
			price: 10,
		},
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg };
};

it("replicates the order info", async () => {
	const { listener, data, msg } = await setup();
	await listener.onMessage(data, msg);

	const order = await Order.findById(data.id);
	expect(order!.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
	const { listener, data, msg } = await setup();
	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});
