import Header from "@/components/elements/header";
import { cn } from "@/lib/utils";
import {Newsreader} from "next/font/google"
const newsreader = Newsreader({
  style: "normal",
  subsets: ["latin"]
})
export default function HomePage() {
  return (
    <main className="flex min-h-screen  justify-center bg-[#f4f4f4] text-black">
      {/* The inner content */}
      <div className="sm:w-[500px] md:w-[600px] lg:w-[800px] xl:w-[600px]">
        <h1 className={cn("text-5xl")}>Privacy friendly emails on a hole new level, completely open-source</h1>
      </div>
    </main>
  );
}
