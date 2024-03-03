import { Publisher, Subjects } from "@kartikcse/common";
import type { PaymentCreatedEvent } from "@kartikcse/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;
}
