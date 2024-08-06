import Link from "next/link";

export default function Footer() {
  return (
    <div className="flex flex-col items-center justify-between md:flex-row">
      <div className="flex flex-col">
        <p className="text-[#666666]">
          Made by <Link href="https://henri.gg">henri</Link> and the github
          community.
        </p>
      </div>
    </div>
  );
}
