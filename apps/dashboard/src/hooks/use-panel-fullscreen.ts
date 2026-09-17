import { useEffect, useRef, useState } from "react";

export function usePanelFullscreen() {
	const panelRef = useRef<HTMLElement>(null);
	const [isFullscreen, setIsFullscreen] = useState(false);

	useEffect(() => {
		const panel = panelRef.current;
		if (!(isFullscreen && panel)) return;

		const previousFocus = document.activeElement;
		if (!panel.contains(previousFocus)) {
			panel
				.querySelector<HTMLButtonElement>("button")
				?.focus({ preventScroll: true });
		}
		const siblings = new Map<HTMLElement, boolean>();
		let current: HTMLElement = panel;
		while (current.parentElement) {
			for (const sibling of current.parentElement.children) {
				if (sibling !== current && sibling instanceof HTMLElement) {
					siblings.set(sibling, sibling.inert);
					sibling.inert = true;
				}
			}
			current = current.parentElement;
			if (current === document.body) break;
		}
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.key === "Escape" &&
				!event.defaultPrevented &&
				!event.isComposing
			) {
				event.preventDefault();
				setIsFullscreen(false);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = previousOverflow;
			for (const [sibling, inert] of siblings) sibling.inert = inert;
			if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
				previousFocus.focus({ preventScroll: true });
			}
		};
	}, [isFullscreen]);

	return {
		panelRef,
		isFullscreen,
		toggleFullscreen: () => setIsFullscreen((value) => !value),
	};
}

export const panelFullscreenClassName =
	"fixed inset-0 z-50 flex h-dvh w-full rounded-none pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]";
