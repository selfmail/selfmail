import Link from "next/link";
import NewAdresseForm from "./form";
import { ChevronLeft } from "lucide-react";

export default async function NewAdresse() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen relative">
            <Link href="/adresse" className="absolute top-4 left-4"><ChevronLeft className="h-4 w-4" /></Link>
            <NewAdresseForm />
        </div>
    )
}