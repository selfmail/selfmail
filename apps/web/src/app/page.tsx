import Header from "@/components/elements/header";
import { cn } from "@/lib/utils";
import { Newsreader } from "next/font/google";
import { Button } from "ui";
import Slider from "./slider";
const newsreader = Newsreader({
  style: "normal",
  subsets: ["latin"],
});
export default function HomePage() {
  return (
    <main className="mx-5 mt-32 min-h-screen space-y-32 text-black md:w-[500px] lg:w-[600px]">
      <div className="space-y-4">
        <h1 className={cn("text-5xl")}>
          Privacy friendly emails on a hole new level, free{" "}
          <span className={newsreader.className}>&</span> open-source.
        </h1>
        <p className="text-[#666666]">
          Our platform aims to be the bridge between modern and sleek interfaces
          and privacy friendly systems.
        </p>
        <div className="flex space-x-2">
          <Button>Start now</Button>
          <Button className="text-black" variant={"secondary"}>
            Login
          </Button>
        </div>
      </div>

      {/* Slider */}
      <Slider />
    </main>
  );
}
