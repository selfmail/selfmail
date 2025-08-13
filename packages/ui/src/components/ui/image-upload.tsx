import { type ChangeEvent, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

export interface ImageUploadProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	onImageChange: (file: File | null) => void;
	previewUrl?: string;
	className?: string;
	buttonText?: string;
	removeButtonText?: string;
}

export function ImageUpload({
	onImageChange,
	previewUrl: initialPreviewUrl,
	className,
	buttonText = "Upload Image",
	removeButtonText = "Remove",
	id,
	...props
}: ImageUploadProps) {
	const [previewUrl, setPreviewUrl] = useState<string | undefined>(
		initialPreviewUrl,
	);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;

		if (file) {
			const objectUrl = URL.createObjectURL(file);
			setPreviewUrl(objectUrl);
			onImageChange(file);
		}
	};

	const handleRemoveImage = () => {
		setPreviewUrl(undefined);
		if (inputRef.current) {
			inputRef.current.value = "";
		}
		onImageChange(null);
	};

	const triggerFileInput = () => {
		inputRef.current?.click();
	};

	return (
		<div className={cn("flex flex-col items-center space-y-4", className)}>
			<input
				type="file"
				className="hidden"
				accept="image/*"
				onChange={handleImageChange}
				ref={inputRef}
				id={id}
				{...props}
			/>

			{previewUrl ? (
				<div className="relative flex flex-col items-center">
					<img
						src={previewUrl}
						alt="Preview"
						className="h-24 w-24 rounded-full border border-neutral-200 object-cover"
					/>
					<Button
						type="button"
						variant="destructive"
						size="sm"
						onClick={handleRemoveImage}
						className="mt-2"
					>
						{removeButtonText}
					</Button>
				</div>
			) : (
				<button
					type="button"
					className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-2 border-neutral-300 border-dashed bg-neutral-100 transition-colors hover:bg-neutral-200"
					onClick={triggerFileInput}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							triggerFileInput();
						}
					}}
				>
					<span className="text-neutral-500 text-sm">No image</span>
				</button>
			)}

			{!previewUrl && (
				<Button type="button" variant="outline" onClick={triggerFileInput}>
					{buttonText}
				</Button>
			)}
		</div>
	);
}
