import Header from "@/components/elements/header";
import Link from "next/link";
import { Button } from "ui";
import Img from "next/image";

export default function HomePage() {
  return (
    <main className="flex min-h-screen  justify-center bg-white dark:bg-[#111011]">
      {/* The inner content */}
      <div className="sm:w-[500px] md:w-[600px] lg:w-[800px] xl:w-[900px]">
        <Header />
        {/* The hero section */}
        <div className="h-36" />
        <h1 className="lg:w-4xl md:w-3xl w-[80%] text-2xl font-medium text-[#111011] dark:text-[#f5f5f5] xl:text-5xl">
          Create modern and privacy focused emails fast.
        </h1>
        <p className="mt-3 w-[50%] leading-5 text-[#111011] dark:text-[#f5f5f5]">
          Selfmail is a self-hostable email provider, which is focused on the
          design, the features, and privacy.
        </p>
        {/* The hero image of the dashboard */}

        {/* The features section */}
        <h2 className=" text-xl font-medium text-[#111011] dark:text-[#f5f5f5] md:text-3xl">
          Features
        </h2>
      </div>
    </main>
  );
}
