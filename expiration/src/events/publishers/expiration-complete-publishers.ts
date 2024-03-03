import { Subjects, Publisher } from "@kartikcse/common";
import type { ExpirationCompleteEvent } from "@kartikcse/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
	readonly subject = Subjects.ExpirationComplete;
}
