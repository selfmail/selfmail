import { PostHog } from 'posthog-node'

export abstract class Analytics {
	static dashboardClient  = new PostHog(import.meta.env.PUBLIC_POSTHOG_KEY || "", {
		host: 'https://eu.i.posthog.com',
	})

	static async captureDashboardEvent({distinctId, event, properties}: {event: string, distinctId: string, properties?: Record<string, any>}): Promise<void> {
		this.dashboardClient.capture({
			distinctId: distinctId,
			event: event,
			properties: properties,
		});
	}
}
