"use client";

import { useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "ui/form";

interface FileUploadProps {
	onFileSelect: (file: File) => void;
	// biome-ignore lint/suspicious/noExplicitAny: I can't predict the type ._.
	form: UseFormReturn<any, any, any>;
}

export function FileUpload({ onFileSelect, form }: FileUploadProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			onFileSelect(file);
		}
	};

	return (
		<div className="grid gap-2">
			<FormField
				name="file"
				control={form.control}
				render={({ field }) => (
					<FormItem className="border-2 cursor-pointer border-border border-dashed rounded-lg p-5 ">
						<FormLabel>Upload File</FormLabel>
						<FormControl>
							<input
								multiple
								type="file"
								tabIndex={-1}
								className="hidden"
								{...field}
								onChange={handleFileChange}
							/>
						</FormControl>
						<FormDescription>
							Upload a new file to import your emails.
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
}
