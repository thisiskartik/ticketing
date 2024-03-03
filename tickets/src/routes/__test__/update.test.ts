import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("returns a 404 if the provided id does not exist", async () => {
	const id = new mongoose.Types.ObjectId().toHexString();
	await request(app)
		.put(`/api/tickets/${id}`)
		.set("Cookie", global.signin())
		.send({
			title: "Sample Title",
			price: 20,
		})
		.expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
	const id = new mongoose.Types.ObjectId().toHexString();
	await request(app)
		.put(`/api/tickets/${id}`)
		.send({
			title: "Sample Title",
			price: 20,
		})
		.expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
	const response = await request(app)
		.post("/api/tickets/")
		.set("Cookie", global.signin())
		.send({
			title: "Sample Title",
			price: 20,
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set("Cookie", global.signin())
		.send({
			title: "Updated Title",
			price: 10,
		})
		.expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
	const cookie = global.signin();
	const response = await request(app)
		.post("/api/tickets/")
		.set("Cookie", cookie)
		.send({
			title: "Sample Title",
			price: 20,
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set("Cookie", cookie)
		.send({
			price: 20,
		})
		.expect(400);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set("Cookie", cookie)
		.send({
			title: "",
			price: 20,
		})
		.expect(400);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set("Cookie", cookie)
		.send({
			title: "Updated Title",
		})
		.expect(400);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set("Cookie", cookie)
		.send({
			title: "Updated Title",
			price: -10,
		})
		.expect(400);
});

it("updates the ticket provided valid inputs", async () => {
	const cookie = global.signin();
	const response = await request(app)
		.post("/api/tickets/")
		.set("Cookie", cookie)
		.send({
			title: "Sample Title",
			price: 20,
		})
		.expect(201);

	const title = "Updated Title";
	const price = 10;
	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set("Cookie", cookie)
		.send({
			title,
			price,
		})
		.expect(200);

	const ticketResponse = await request(app)
		.get(`/api/tickets/${response.body.id}`)
		.send()
		.expect(200);

	expect(ticketResponse.body.title).toEqual(title);
	expect(ticketResponse.body.price).toEqual(price);
});

it("publishes an event", async () => {
	const cookie = global.signin();
	const response = await request(app)
		.post("/api/tickets/")
		.set("Cookie", cookie)
		.send({
			title: "Sample Title",
			price: 20,
		})
		.expect(201);
	jest.clearAllMocks();

	const title = "Updated Title";
	const price = 10;
	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set("Cookie", cookie)
		.send({
			title,
			price,
		})
		.expect(200);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updates if the ticket is reserved", async () => {
	const cookie = global.signin();
	const response = await request(app)
		.post("/api/tickets/")
		.set("Cookie", cookie)
		.send({
			title: "Sample Title",
			price: 20,
		})
		.expect(201);

	const ticket = await Ticket.findById(response.body.id);
	ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
	await ticket!.save();

	const title = "Updated Title";
	const price = 10;
	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set("Cookie", cookie)
		.send({
			title,
			price,
		})
		.expect(400);
});
