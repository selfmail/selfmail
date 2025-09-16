
import { useEffect } from "react";

/**
 * useTitle - React hook to set the document title and handle cleanup.
 *
 * @param title - The title to set. If falsy, resets to fallbackTitle.
 * @param fallbackTitle - The title to use if title is not provided. Defaults to "Selfmail".
 */
export function useTitle(title?: string, fallbackTitle = "Selfmail") {
    useEffect(() => {
        if (title) {
            document.title = title;
        } else {
            document.title = fallbackTitle;
        }
        return () => {
            document.title = fallbackTitle;
        };
    }, [title, fallbackTitle]);
}
