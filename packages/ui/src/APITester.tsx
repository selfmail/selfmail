import { type FormEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "./lib/utils";

export function APITester() {
	const responseInputRef = useRef<HTMLTextAreaElement>(null);

	const testEndpoint = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			const form = e.currentTarget;
			const formData = new FormData(form);
			const endpoint = formData.get("endpoint") as string;
			const url = new URL(endpoint, location.href);
			const method = formData.get("method") as string;
			const res = await fetch(url, { method });

			const data = await res.json();
			responseInputRef.current!.value = JSON.stringify(data, null, 2);
		} catch (error) {
			responseInputRef.current!.value = String(error);
		}
	};

	return (
		<div className="mx-auto mt-8 flex w-full max-w-2xl flex-col gap-4 text-left">
			<form
				onSubmit={testEndpoint}
				className="flex w-full items-center gap-2 rounded-xl border border-input bg-card p-3 font-mono"
			>
				<Select name="method" defaultValue="GET">
					<SelectTrigger className="w-[100px]">
						<SelectValue placeholder="Method" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="GET">GET</SelectItem>
						<SelectItem value="PUT">PUT</SelectItem>
					</SelectContent>
				</Select>

				<Input
					type="text"
					name="endpoint"
					defaultValue="/api/hello"
					className={cn(
						"flex-1 font-mono",
						"border-0 bg-transparent shadow-none",
						"focus-visible:ring-0 focus-visible:ring-offset-0",
					)}
					placeholder="/api/hello"
				/>

				<Button type="submit" variant="secondary">
					Send
				</Button>
			</form>

			<textarea
				ref={responseInputRef}
				readOnly
				placeholder="Response will appear here..."
				className={cn(
					"min-h-[140px] w-full bg-card",
					"rounded-xl border border-input p-3",
					"resize-y font-mono",
					"placeholder:text-muted-foreground",
				)}
			/>
		</div>
	);
}
