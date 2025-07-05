export {};

declare global {
	var devmode: boolean;
	var posthog: {
		capture: (event: {
			distinctId: string;
			event: string;
			properties?: Record<string, any>;
		}) => void;
	};
	var createOutboundLog: (name: string) => (event: string) => void;
	var createInboundLog: (name: string) => (event: string) => void;
}
