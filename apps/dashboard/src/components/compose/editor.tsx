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
import { ProseKit, useDocChange, useEditorDerivedValue } from "prosekit/react";
import { useCallback, useMemo } from "react";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { Button, cn } from "#/components/ui";

type ComposeEditorProps = {
	initialMarkdown?: string;
	onMarkdownChange?: (markdown: string) => void;
};

type ActiveEditorState = {
	bold: boolean;
	bulletList: boolean;
	heading: boolean;
	italic: boolean;
};

const toolbarButtonClassName =
	"size-8 rounded-lg px-0 text-xs data-[active=true]:bg-accent data-[active=true]:text-accent-foreground";

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
	onMarkdownChange,
}: ComposeEditorProps) {
	const editor = useMemo(() => {
		const extension = union(
			defineBasicExtension(),
			definePlaceholder({
				placeholder: "Write your email...",
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

	const deriveActiveState = useCallback(
		(currentEditor: typeof editor): ActiveEditorState => ({
			bold: currentEditor.marks.bold.isActive(),
			bulletList: currentEditor.nodes.list.isActive({ kind: "bullet" }),
			heading: currentEditor.nodes.heading.isActive({ level: 2 }),
			italic: currentEditor.marks.italic.isActive(),
		}),
		[],
	);
	const active = useEditorDerivedValue(deriveActiveState, { editor });

	const handleDocChange = useCallback(() => {
		onMarkdownChange?.(markdownFromHTML(editor.getDocHTML()));
	}, [editor, onMarkdownChange]);

	useDocChange(handleDocChange, { editor });

	return (
		<div className="flex min-h-64 flex-col overflow-hidden rounded-lg border border-border bg-background">
			<div className="flex items-center gap-1 border-border border-b bg-muted p-2">
				<Button
					aria-label="Bold"
					className={toolbarButtonClassName}
					data-active={active.bold}
					onClick={() => editor.commands.toggleBold()}
					title="Bold"
					type="button"
					variant="ghost"
				>
					B
				</Button>
				<Button
					aria-label="Italic"
					className={toolbarButtonClassName}
					data-active={active.italic}
					onClick={() => editor.commands.toggleItalic()}
					title="Italic"
					type="button"
					variant="ghost"
				>
					I
				</Button>
				<Button
					aria-label="Heading"
					className={toolbarButtonClassName}
					data-active={active.heading}
					onClick={() => editor.commands.toggleHeading({ level: 2 })}
					title="Heading"
					type="button"
					variant="ghost"
				>
					H
				</Button>
				<Button
					aria-label="Bullet list"
					className={toolbarButtonClassName}
					data-active={active.bulletList}
					onClick={() => editor.commands.toggleList({ kind: "bullet" })}
					title="Bullet list"
					type="button"
					variant="ghost"
				>
					-
				</Button>
			</div>
			<ProseKit editor={editor}>
				<div className="relative min-h-52 flex-1 overflow-y-auto">
					<div
						className={cn(
							"ProseMirror min-h-52 px-4 py-3 text-foreground text-sm outline-none",
							"prosekit-typography max-w-none text-pretty",
							"[&_a]:text-primary [&_a]:underline [&_blockquote]:border-border [&_blockquote]:text-muted-foreground",
							"[&_.prosekit-placeholder:before]:text-muted-foreground",
						)}
						ref={editor.mount}
					/>
				</div>
			</ProseKit>
		</div>
	);
}
