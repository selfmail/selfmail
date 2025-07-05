import chalk from "chalk";

export function createInboundLog(event: string) {
	return (message: string) => {
		console.log(
			`${chalk.yellow(`[INBOUND-${event.toUpperCase()}]`)} ${message}`,
		);
	};
}
export function createOutboundLog(event: string) {
	return (message: string) => {
		console.log(`${chalk.blue(`[OUTBUND-${event.toUpperCase()}]`)} ${message}`);
	};
}
