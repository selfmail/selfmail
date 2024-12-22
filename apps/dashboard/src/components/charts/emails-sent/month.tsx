"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "ui/chart";

const chartData = [
	{ month: "January", received: 186, sent: 80 },
	{ month: "February", received: 305, sent: 200 },
	{ month: "March", received: 237, sent: 120 },
	{ month: "April", received: 73, sent: 190 },
	{ month: "May", received: 209, sent: 130 },
	{ month: "June", received: 214, sent: 140 },
	{ month: "July", received: 214, sent: 140 },
	{ month: "August", received: 214, sent: 140 },
	{ month: "September", received: 214, sent: 140 },
	{ month: "October", received: 214, sent: 140 },
	{ month: "November", received: 214, sent: 140 },
	{ month: "December", received: 214, sent: 140 },
];

const chartConfig = {
	received: {
		label: "Received",
		color: "#2563eb",
	},
	sent: {
		label: "Sent",
		color: "#60a5fa",
	},
} satisfies ChartConfig;

export function ChartEmailsSentMonth() {
	return (
		<ChartContainer config={chartConfig} className="h-[200px] w-full">
			<BarChart accessibilityLayer data={chartData}>
				<CartesianGrid vertical={false} />
				<XAxis
					dataKey="month"
					tickLine={false}
					tickMargin={10}
					axisLine={false}
					tickFormatter={(value) => value.slice(0, 3)}
				/>
				<YAxis
					dataKey="received"
					axisLine={false}
					tickLine={false}
					tickFormatter={(value) => value.toString()}
				/>
				<ChartTooltip content={<ChartTooltipContent />} />
				<ChartLegend content={<ChartLegendContent />} />
				<Bar dataKey="received" fill="var(--color-received)" radius={4} />
				<Bar dataKey="sent" fill="var(--color-sent)" radius={4} />
			</BarChart>
		</ChartContainer>
	);
}
