"use client";

import Image from "next/image";

export default function LoginImage() {
  return (
    <div className="m-3 hidden lg:block w-[50%] rounded-xl bg-[#f4f4f4] relative">
      <Image src="/plane.png" alt="Plane" layout="fill" objectFit="contain" />
    </div>
  );
}
