import { useViewportSize } from "@mantine/hooks";
import { BotIcon, ReplyIcon, TrashIcon, XIcon } from "lucide-react";
import { motion } from "motion/react";
import type { EmailData } from "@/types/email";
export default function EmailViewer({
  open,
  setOpen,
  selectedEmail,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedEmail: EmailData | null;
}) {
  const { width } = useViewportSize();

  if (!selectedEmail) return null;

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: width,
      }}
      animate={{
        opacity: open ? 1 : 0,
        x: open ? width / 2 - 32 : width,
      }}
      transition={{
        type: "keyframes",
        duration: 0.25,
        ease: "easeInOut",
      }}
      className="fixed inset-4 flex w-[50%] flex-col rounded-xl bg-white border border-neutral-200 shadow-lg overflow-hidden"
    >
      <div className="flex flex-row items-center justify-between p-4 border-b border-neutral-100">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium">
            {selectedEmail.avatar}
          </div>
          <div>
            <h2 className="font-semibold text-lg">{selectedEmail.subject}</h2>
            <p className="text-sm text-neutral-600">
              From: {selectedEmail.from} • {selectedEmail.date}
            </p>
          </div>
        </div>
        <div className="flex flex-row items-center space-x-2">
          <TrashIcon
            className="h-5 w-5 cursor-pointer rounded-sm p-1 bg-transparent text-red-500 ring-0 ring-neutral-200 transition-all hover:bg-red-50 hover:ring-2"
            color="#ef4444"
          />
          <ReplyIcon className="h-5 w-5 cursor-pointer rounded-sm p-1 bg-transparent ring-0 ring-neutral-200 transition-all hover:bg-neutral-100 hover:ring-2" />
          <BotIcon className="h-5 w-5 cursor-pointer rounded-sm p-1 bg-transparent ring-0 ring-neutral-200 transition-all hover:bg-neutral-100 hover:ring-2" />
          <XIcon
            onClick={() => setOpen(false)}
            className="h-5 w-5 cursor-pointer rounded-sm p-1 bg-transparent ring-0 ring-neutral-200 transition-all hover:bg-neutral-100 hover:ring-2"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-neutral-800 leading-relaxed">
            {selectedEmail.content}
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-100 p-4 bg-neutral-50">
        <div className="flex space-x-3">
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Reply
          </button>
          <button className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors">
            Forward
          </button>
          <button className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors">
            Archive
          </button>
        </div>
      </div>
    </motion.div>
  );
}
