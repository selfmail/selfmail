import "prosekit/basic/style.css";
import "prosekit/basic/typography.css";
import "prosekit/extensions/list/style.css";
import "prosekit/extensions/placeholder/style.css";

import { defineBasicExtension } from "prosekit/basic";
import { createEditor, jsonFromHTML, union } from "prosekit/core";
import { defineBlockquoteInputRule } from "prosekit/extensions/blockquote";
import { defineBoldInputRule } from "prosekit/extensions/bold";
import { defineCodeInputRule } from "prosekit/extensions/code";
import {
	defineCodeBlockEnterRule,
	defineCodeBlockInputRule,
} from "prosekit/extensions/code-block";
import { defineHeadingInputRule } from "prosekit/extensions/heading";
import { defineItalicInputRule } from "prosekit/extensions/italic";
import {
	defineLinkEnterRule,
	defineLinkInputRule,
	defineLinkPasteRule,
} from "prosekit/extensions/link";
import { defineListInputRules } from "prosekit/extensions/list";
import { definePlaceholder } from "prosekit/extensions/placeholder";
import { ProseKit, useDocChange } from "prosekit/react";
import { useCallback, useMemo, useRef, useState } from "react";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { cn } from "#/components/ui";
import { m } from "#/paraglide/messages";

type ComposeEditorProps = {
	initialMarkdown?: string;
	onFilesDrop?: (files: File[]) => void;
	onMarkdownChange?: (markdown: string) => void;
};

function markdownFromHTML(html: string): string {
	return unified()
		.use(rehypeParse)
		.use(rehypeRemark)
		.use(remarkGfm)
		.use(remarkStringify)
		.processSync(html)
		.toString();
}

function htmlFromMarkdown(markdown: string): string {
	return unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkHtml)
		.processSync(markdown)
		.toString();
}

export function ComposeEditor({
	initialMarkdown,
	onFilesDrop,
	onMarkdownChange,
}: ComposeEditorProps) {
	const dragDepth = useRef(0);
	const [isDraggingFiles, setIsDraggingFiles] = useState(false);
	const editor = useMemo(() => {
		const extension = union(
			defineBasicExtension(),
			definePlaceholder({
				placeholder: m["dashboard.compose.editor_placeholder"](),
				strategy: "doc",
			}),
			defineBlockquoteInputRule(),
			defineBoldInputRule(),
			defineCodeInputRule(),
			defineCodeBlockEnterRule(),
			defineCodeBlockInputRule(),
			defineHeadingInputRule(),
			defineItalicInputRule(),
			defineLinkEnterRule(),
			defineLinkInputRule(),
			defineLinkPasteRule(),
			defineListInputRules(),
		);
		const nextEditor = createEditor({ extension });

		if (initialMarkdown) {
			nextEditor.setContent(
				jsonFromHTML(htmlFromMarkdown(initialMarkdown), {
					schema: nextEditor.schema,
				}),
			);
		}

		return nextEditor;
	}, [initialMarkdown]);

	const handleDocChange = useCallback(() => {
		onMarkdownChange?.(markdownFromHTML(editor.getDocHTML()));
	}, [editor, onMarkdownChange]);

	useDocChange(handleDocChange, { editor });

	return (
		<ProseKit editor={editor}>
			<section
				aria-label={m["dashboard.compose.editor_placeholder"]()}
				className={cn(
					"relative min-h-40 flex-1 overflow-y-auto",
					isDraggingFiles && "bg-accent ring-2 ring-inset ring-primary",
				)}
				onDragEnterCapture={(event) => {
					if (!onFilesDrop || !event.dataTransfer.types.includes("Files")) {
						return;
					}
					event.preventDefault();
					dragDepth.current += 1;
					setIsDraggingFiles(true);
				}}
				onDragLeaveCapture={() => {
					dragDepth.current = Math.max(0, dragDepth.current - 1);
					if (dragDepth.current === 0) {
						setIsDraggingFiles(false);
					}
				}}
				onDragOverCapture={(event) => {
					if (!onFilesDrop || !event.dataTransfer.types.includes("Files")) {
						return;
					}
					event.preventDefault();
					event.stopPropagation();
					event.dataTransfer.dropEffect = "copy";
				}}
				onDropCapture={(event) => {
					dragDepth.current = 0;
					setIsDraggingFiles(false);
					if (!onFilesDrop || !event.dataTransfer.types.includes("Files")) {
						return;
					}
					event.preventDefault();
					event.stopPropagation();
					const files = Array.from(event.dataTransfer.files);
					if (files.length > 0) {
						onFilesDrop(files);
					}
				}}
			>
				<div
					className={cn(
						"ProseMirror h-full px-4 py-3 text-foreground text-sm outline-none",
						"prosekit-typography max-w-none text-pretty",
						"[&_a]:text-primary [&_a]:underline [&_blockquote]:border-border [&_blockquote]:text-muted-foreground",
						"[&_.prosekit-placeholder:before]:text-muted-foreground",
					)}
					ref={editor.mount}
				/>
			</section>
		</ProseKit>
	);
}
