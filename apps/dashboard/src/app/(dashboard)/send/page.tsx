import Editor from "@/components/editor/editor";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import SendButton from "./send-button";
import { SendMail } from "./action";
import { Input } from "ui";

export default function Send() {
    return (
        <main className="min-h-screen bg-[#e8e8e8]">
            <header id="send-header" className="flex flex-col">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-cener space-x-2">
                        <div className="flex items-center">
                            <Link href={"/"}><ChevronLeft className="w-4 h-4" /></Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <SendButton action={SendMail} />
                    </div>
                </div>
                    <Input placeholder="Subject..." className=" outline-none bg-transparent" />
            </header>
            <Editor />
        </main>
    )
}