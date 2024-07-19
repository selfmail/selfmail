import Link from "next/link";
import NewForm from "./new-form";
import { ChevronLeft } from "lucide-react";

export default async function NewPost({
    // TODO: add search params for error handling 
}) {
    return (
        <div className="flex items-center justify-center  min-h-svh relative">
            <Link href={"/help"} className="absolute top-2 left-2">
                <ChevronLeft className="h-5 w-5" />
            </Link>
            <NewForm />
        </div>
    )
}