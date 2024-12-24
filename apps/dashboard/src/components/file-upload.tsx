"use client";

import { useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
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
			console.log(file.size, fileRef.current);
			if (file.size > 100 && fileRef.current) {
				toast.error("File size is too large.");
				fileRef.current.value = "";
				return;
			}
			setSelectedFile(file);
			onFileSelect(file);
		}
	};

	const fileRef = useRef<HTMLInputElement>(null);

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
								type="file"
								accept="image/png, image/jpeg"
								tabIndex={-1}
								className="hidden"
								{...field}
								onChange={handleFileChange}
								ref={fileRef}
							/>
						</FormControl>
						<FormDescription>
							{!selectedFile
								? "Upload a new file to import your emails."
								: `File uploaded successfully. ${selectedFile.name}`}
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
}
