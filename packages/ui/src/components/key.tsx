"use client";

import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { cn } from "../lib/cn";

type KeyItem = string | { display: string; key: string };

interface KbdProps {
  keys: KeyItem[];
  className?: string;
  active?: boolean;
  listenToKeyboard?: boolean;
}

const keySymbolMap = {
  command: "⌘",
  cmd: "⌘",
  control: "⌃",
  ctrl: "⌃",
  alt: "⌥",
  option: "⌥",
  space: "␣",
  arrowleft: "←",
  left: "←",
  arrowdown: "↓",
  down: "↓",
  arrowup: "↑",
  up: "↑",
  arrowright: "→",
  right: "→",
} as const;

const keyHotkeyMap: Record<string, string> = {
  command: "meta",
  cmd: "meta",
  control: "ctrl",
  ctrl: "ctrl",
  alt: "alt",
  option: "alt",
  shift: "shift",
  enter: "enter",
  return: "enter",
  space: "space",
  arrowleft: "left",
  left: "left",
  arrowdown: "down",
  down: "down",
  arrowup: "up",
  up: "up",
  arrowright: "right",
  right: "right",
};

export function Kbd({
  keys = [],
  className,
  active,
  listenToKeyboard = false,
}: KbdProps) {
  const [isPressed, setIsPressed] = useState(false);

  const getKeyDisplay = (item: KeyItem): string => {
    const key = typeof item === "string" ? item : item.display;
    const lowerKey = key.toLowerCase();
    return (
      keySymbolMap[lowerKey as keyof typeof keySymbolMap] || key.toUpperCase()
    );
  };

  const getHotkeyString = (): string => {
    return keys
      .map((item) => {
        const key = typeof item === "string" ? item : item.key;
        const lowerKey = key.toLowerCase();
        return keyHotkeyMap[lowerKey] || lowerKey;
      })
      .join("+");
  };

  useHotkeys(
    getHotkeyString(),
    () => setIsPressed(true),
    {
      enabled: listenToKeyboard,
      keydown: true,
      keyup: false,
      preventDefault: false,
    },
    [keys, listenToKeyboard]
  );

  useEffect(() => {
    if (!listenToKeyboard) {
      return;
    }

    const handleKeyUp = () => {
      setIsPressed(false);
    };

    const handleBlur = () => {
      setIsPressed(false);
    };

    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [listenToKeyboard]);

  const isActive = active || isPressed;

  return (
    <kbd
      className={cn(
        "relative -top-[0.03em] box-border inline-flex min-w-[1.75em] shrink-0 cursor-default select-none items-center justify-center whitespace-nowrap rounded-[0.35em] px-[0.5em] pb-[0.05em] align-text-top font-normal text-[0.75em] leading-[1.7em]",
        "[&>span+span]:ml-0.5",
        isActive
          ? "translate-y-[0.05em] bg-background text-foreground shadow-[inset_0_0.05em_rgba(255,255,255,0.95),inset_0_0.05em_0.2em_rgba(0,0,0,0.1),0_0_0_0.05em_rgba(0,0,0,0.134)] dark:shadow-[inset_0_0.05em_0.2em_rgba(0,0,0,0.3),0_0_0_0.05em_rgba(255,255,255,0.134)]"
          : "bg-background text-foreground shadow-[inset_0_-0.05em_0.5em_rgba(0,0,0,0.034),inset_0_0.05em_rgba(255,255,255,0.95),inset_0_0.25em_0.5em_rgba(0,0,0,0.034),inset_0_-0.05em_rgba(0,0,0,0.172),0_0_0_0.05em_rgba(0,0,0,0.134),0_0.08em_0.17em_rgba(0,0,0,0.231)] dark:shadow-[inset_0_-0.05em_0.5em_rgba(255,255,255,0.034),inset_0_0.05em_rgba(255,255,255,0.1),inset_0_0.25em_0.5em_rgba(255,255,255,0.034),inset_0_-0.05em_rgba(255,255,255,0.172),0_0_0_0.05em_rgba(255,255,255,0.134),0_0.08em_0.17em_rgba(255,255,255,0.231)]",
        className
      )}
    >
      {keys.map((item) => {
        const key =
          typeof item === "string" ? item : `${item.display}-${item.key}`;

        return <span key={key}>{getKeyDisplay(item)}</span>;
      })}
    </kbd>
  );
}
