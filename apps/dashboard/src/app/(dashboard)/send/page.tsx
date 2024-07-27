import Editor from "@/components/editor/editor";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import SendButton from "./send-button";
import { SendMail } from "./action";
import HeaderInputs from "./inputs";
import DropdownMailList from "./dropdown-mail";
import { checkRequest } from "@/server/checkRequest";
import { db } from "database";

export default async function Send() {
    const req = await checkRequest()
    const adresses = await db.adresse.findMany({
        where: {
            userId: req.userId
        }
    }) 
    return (
        <main className="min-h-screen bg-[#e8e8e8]">
            <header id="send-header" className="flex flex-col">
                <div className="flex items-center justify-between px-4 pt-4">
                    <div className="flex items-cener space-x-2">
                        <div className="flex items-center">
                            <Link href={"/"}><ChevronLeft className="w-4 h-4" /></Link>
                            <DropdownMailList adresses={adresses.map((a) => a.email)} />
                        </div>
                    </div>
                    <div className="flex items-center">
                        <SendButton action={SendMail} />
                    </div>
                </div>
                <HeaderInputs />
            </header>
            <Editor />
        </main>
    )
}