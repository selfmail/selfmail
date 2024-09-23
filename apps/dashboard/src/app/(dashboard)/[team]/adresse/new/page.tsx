import Link from "next/link";
import NewAdresseForm from "./form";
import { ChevronLeft } from "lucide-react";

export default async function NewAdresse() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <Link href="/adresse" className="absolute left-4 top-4">
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <NewAdresseForm />
    </div>
  );
}
