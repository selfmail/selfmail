"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export default function AuthToast({
	message,
}: {
	message: string | undefined | null;
}) {
	useEffect(() => {
		if (message) {
			toast.error(message);
		}
	}, [message]);

	return <></>;
}
