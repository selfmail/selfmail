import Header from "@/components/elements/header";
import Link from "next/link";
import { Button } from "ui"
import Img from "next/image"
export default function HomePage() {
  return (
    <main className="flex min-h-screen  bg-white dark:bg-[#111011] justify-center">
      {/* The inner content */}
      <div className="sm:w-[500px] md:w-[600px] lg:w-[800px] xl:w-[900px]">
        <Header />
        <div className="h-36" />
        <h1 className="text-[#111011] dark:text-[#f5f5f5] font-medium xl:text-5xl lg:w-4xl md:w-3xl text-2xl w-[80%]">Create modern and privacy focused emails fast.</h1>
        <p className="w-[50%] text-[#111011] dark:text-[#f5f5f5] leading-5 mt-3">
          Selfmail is a self-hostable email provider, which is focused on the design, the features, and privacy.
        </p>
        {/* The hero image of the dashboard */}
        
      </div>
    </main>
  );
}
