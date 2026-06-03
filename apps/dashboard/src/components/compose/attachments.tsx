import { FileIcon, PaperclipIcon, XIcon } from "lucide-react";
import { useRef } from "react";
import { Button, cn } from "#/components/ui";

interface AttachmentUploadProps {
  attachments: ComposeAttachment[];
  onAttachmentsChange: (attachments: ComposeAttachment[]) => void;
}

export interface ComposeAttachment {
  file: File;
  id: string;
}

function createAttachment(file: File): ComposeAttachment {
  return {
    file,
    id: `${file.name}-${file.lastModified}-${file.size}-${crypto.randomUUID()}`,
  };
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function AttachmentUpload({
  attachments,
  onAttachmentsChange,
}: AttachmentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) {
      return;
    }

    onAttachmentsChange([
      ...attachments,
      ...Array.from(fileList, createAttachment),
    ]);
  };

  return (
    <section aria-label="Attachments" className="flex flex-col gap-2">
      <input
        className="sr-only"
        multiple
        onChange={(event) => {
          handleFiles(event.currentTarget.files);
          event.currentTarget.value = "";
        }}
        ref={inputRef}
        type="file"
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <PaperclipIcon className="size-4" />
          <span className="tabular-nums">{attachments.length} attached</span>
        </div>
        <Button
          className="h-8 rounded-lg px-3 text-xs"
          onClick={() => inputRef.current?.click()}
          type="button"
          variant="outline"
        >
          <PaperclipIcon />
          Upload
        </Button>
      </div>
      {attachments.length > 0 ? (
        <ul className="grid gap-2">
          {attachments.map((attachment) => (
            <li
              className="grid grid-cols-[1rem_1fr_auto] items-center gap-3 rounded-lg bg-muted px-3 py-2 text-sm"
              key={attachment.id}
            >
              <FileIcon className="size-4 text-muted-foreground" />
              <div className="min-w-0">
                <p className="truncate text-foreground">
                  {attachment.file.name}
                </p>
                <p className="text-muted-foreground text-xs tabular-nums">
                  {formatFileSize(attachment.file.size)}
                </p>
              </div>
              <Button
                aria-label={`Remove ${attachment.file.name}`}
                className={cn("size-8 rounded-lg", "hover:text-destructive")}
                onClick={() =>
                  onAttachmentsChange(
                    attachments.filter((item) => item.id !== attachment.id)
                  )
                }
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <XIcon />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
