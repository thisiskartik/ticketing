import { Publisher, Subjects } from "@kartikcse/common";
import type { TicketUpdatedEvent } from "@kartikcse/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
}
