import Link from "next/link";
import NewForm from "./new-form";
import { ChevronLeft } from "lucide-react";

export default async function NewPost(
  {
    // TODO: add search params for error handling
  },
) {
  return (
    <div className="relative flex min-h-svh items-center justify-center">
      <Link href={"/help"} className="absolute left-2 top-2">
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <NewForm />
    </div>
  );
}
