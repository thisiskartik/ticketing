import { Publisher, Subjects } from "@kartikcse/common";
import type { TicketCreatedEvent } from "@kartikcse/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
	readonly subject = Subjects.TicketCreated;
}
