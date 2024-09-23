
import { checkRequest } from "@/server/checkRequest";
import { db } from "database";
import { ChevronLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SendMail } from "./action";
import DropdownMailList from "./dropdown-mail";
import HeaderInputs from "./inputs";
import SendButton from "./send-button";

const Editor = dynamic(() => import("@/components/editor/editor"), {
  ssr: false, loading: () => (
    <div className="flex items-center">
      <span className="mx-2 h-2 w-2 animate-pulse rounded-full bg-neutral-700" />
      <p>
        Loading the editor...
      </p>
    </div>
  )
});

export default async function Send() {

  const req = await checkRequest();
  const adresses = await db.adresse.findMany({
    where: {
      userId: req.userId,
    },
  });

  return (
    <main className="min-h-screen bg-[#e8e8e8]">
      <header id="send-header" className="flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center space-x-3">
            <Link href={"/"}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <DropdownMailList adresses={adresses.map((a) => a.email)} />
          </div>
          <div className="flex items-center">
            <SendButton action={SendMail} />
          </div>
        </div>
        <HeaderInputs />
      </header>
      <Editor />
    </main>
  );
}
