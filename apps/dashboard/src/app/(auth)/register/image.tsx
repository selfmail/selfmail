"use client";

import Image from "next/image";

export default function RegisterImage() {
  return (
    <div className="m-3 flex w-[50%] relative items-center justify-center rounded-xl bg-[#f4f4f4]">
      <Image src="/plane.png" alt="Plane" fill style={{ objectFit: "cover" }} />
    </div>
  );
}
