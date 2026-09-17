// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { usePanelFullscreen } from "./use-panel-fullscreen";

function Panel() {
	const { panelRef, isFullscreen, toggleFullscreen } = usePanelFullscreen();
	return (
		<div>
			<button type="button">Inbox</button>
			<aside ref={panelRef}>
				<button
					type="button"
					aria-pressed={isFullscreen}
					onClick={toggleFullscreen}
				>
					Fullscreen
				</button>
				<input aria-label="Draft" defaultValue="" />
			</aside>
		</div>
	);
}

afterEach(cleanup);

it("preserves the draft and restores the background and focus on Escape", () => {
	render(<Panel />);
	const button = screen.getByRole("button", { name: "Fullscreen" });
	const inbox = screen.getByRole("button", { name: "Inbox" });
	fireEvent.change(screen.getByLabelText("Draft"), {
		target: { value: "Unsent draft" },
	});
	button.focus();
	fireEvent.click(button);
	expect(button.getAttribute("aria-pressed")).toBe("true");
	expect(inbox.inert).toBe(true);
	expect(document.body.style.overflow).toBe("hidden");
	fireEvent.keyDown(screen.getByLabelText("Draft"), { key: "Escape" });
	expect(button.getAttribute("aria-pressed")).toBe("false");
	expect(inbox.inert).toBeFalsy();
	expect(document.body.style.overflow).toBe("");
	expect(document.activeElement).toBe(button);
	expect((screen.getByLabelText("Draft") as HTMLInputElement).value).toBe(
		"Unsent draft",
	);
});

it("restores the split view with the toggle button", () => {
	render(<Panel />);
	const button = screen.getByRole("button", { name: "Fullscreen" });
	fireEvent.click(button);
	fireEvent.click(button);
	expect(button.getAttribute("aria-pressed")).toBe("false");
	expect(document.body.style.overflow).toBe("");
	expect(screen.getByRole("button", { name: "Inbox" }).inert).toBeFalsy();
});

it("cleans up fullscreen on unmount and leaves handled Escape events alone", () => {
	const { unmount } = render(<Panel />);
	const button = screen.getByRole("button", { name: "Fullscreen" });
	fireEvent.click(button);
	const event = new KeyboardEvent("keydown", {
		key: "Escape",
		bubbles: true,
		cancelable: true,
	});
	event.preventDefault();
	window.dispatchEvent(event);
	expect(button.getAttribute("aria-pressed")).toBe("true");
	unmount();
	expect(document.body.style.overflow).toBe("");
});
