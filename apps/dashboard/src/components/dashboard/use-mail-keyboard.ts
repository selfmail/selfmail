import { useEffect, useRef } from "react";

interface MailKeyboardOptions {
  emailId?: string;
  previewOpen: boolean;
  composeOpen: boolean;
  onSelectEmail: (emailId: string) => void;
  onClosePreview: () => void;
  onCloseCompose: () => void;
}

const overlaySelector =
  '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]';
const interactiveSelector =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="combobox"], [role="slider"], [role="separator"], [role="menuitem"], [role="tab"]';

export function useMailKeyboard({
  emailId,
  previewOpen,
  composeOpen,
  onSelectEmail,
  onClosePreview,
  onCloseCompose,
}: MailKeyboardOptions) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        document.querySelector(overlaySelector)
      ) {
        return;
      }
      const target = event.target;
      const buttons = Array.from(
        listRef.current?.querySelectorAll<HTMLButtonElement>(
          "button[data-email-id]"
        ) ?? []
      );
      const selected = buttons.find(
        (button) => button.dataset.emailId === emailId
      );

      if (event.key === "Escape") {
        if (event.repeat || !(previewOpen || composeOpen)) {
          return;
        }
        event.preventDefault();
        if (previewOpen) {
          onClosePreview();
          if (
            target instanceof Element &&
            target.closest("[data-email-preview]")
          ) {
            (selected ?? buttons[0])?.focus();
          }
        } else {
          onCloseCompose();
          (selected ?? buttons[0])?.focus();
        }
        return;
      }

      if (
        !(target instanceof HTMLElement) ||
        target.closest(interactiveSelector) ||
        (target !== document.body && !listRef.current?.contains(target))
      ) {
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
        return;
      }
      const focusedIndex = buttons.findIndex((button) =>
        button.contains(target)
      );
      const index =
        focusedIndex >= 0
          ? focusedIndex
          : selected
            ? buttons.indexOf(selected)
            : -1;
      const nextIndex =
        index < 0
          ? 0
          : Math.max(
              0,
              Math.min(
                buttons.length - 1,
                index + (event.key === "ArrowDown" ? 1 : -1)
              )
            );
      const next = buttons[nextIndex];
      if (!next?.dataset.emailId) return;
      event.preventDefault();
      next.focus({ preventScroll: true });
      next.scrollIntoView({ block: "nearest" });
      onSelectEmail(next.dataset.emailId);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    emailId,
    previewOpen,
    composeOpen,
    onSelectEmail,
    onClosePreview,
    onCloseCompose,
  ]);

  return listRef;
}
