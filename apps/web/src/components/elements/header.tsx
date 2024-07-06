"use client";

import Link from "next/link";
import BoxLight from "@/../public/box-light.svg";
import BoxDark from "@/../public/box.svg";
import { useTheme } from "next-themes";
import Img from "next/image";
import { Button } from "ui";

/**
 * The Header for the homepage.
 * @returns {JSX.Element}
 */
export default function Header(): JSX.Element {
  const theme = useTheme();
  return (
    <div className="flex h-14 w-full items-center justify-between">
      <h2 className="flex items-center text-xl font-medium">
        <Link href={"/"}>
          {theme.theme === "dark" ? (
            <Img
              className="mr-2"
              height={25}
              width={25}
              alt="our light logo"
              src={BoxLight}
            />
          ) : (
            <Img
              className="mr-2"
              height={25}
              width={25}
              alt="our dark logo"
              src={BoxDark}
            />
          )}
        </Link>
        selfmail
      </h2>

      <nav className="space-x-2">
        <Link
          className="text-[#282828] transition hover:text-[#111011] dark:text-[#e1e1e1] hover:dark:text-[#f5f5f5]"
          href={"/pricing"}
        >
          Pricing
        </Link>
        <Link
          className="text-[#282828] transition hover:text-[#111011] dark:text-[#e1e1e1] hover:dark:text-[#f5f5f5]"
          href={"/selfhost"}
        >
          Selfhost
        </Link>
        <Link
          className="text-[#282828] transition hover:text-[#111011] dark:text-[#e1e1e1] hover:dark:text-[#f5f5f5]"
          href={
            process.env.NODE_ENV === "development"
              ? "https://localhost:6000/login"
              : "https://app.selfmail.io/login"
          }
        >
          Login
        </Link>
        <Link
          href={
            process.env.NODE_ENV === "development"
              ? "https://localhost:6000/register"
              : "https://app.selfmail.io/register"
          }
        >
          <Button>Register</Button>
        </Link>
      </nav>
    </div>
  );
}
