"use client";

import QRCodeLib from "qrcode";
import { type SVGProps, useMemo } from "react";
import { cn } from "../lib/cn";

interface QRCodeProps extends SVGProps<SVGSVGElement> {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  className?: string;
}

function isInFinderPattern(row: number, col: number, size: number): boolean {
  return (
    (row < 7 && col < 7) ||
    (row < 7 && col >= size - 7) ||
    (row >= size - 7 && col < 7)
  );
}

export function QRCode({
  value,
  size = 268,
  fgColor = "var(--foreground)",
  bgColor = "var(--background)",
  errorCorrectionLevel = "M",
  className,
  ...props
}: QRCodeProps) {
  const qrData = useMemo(() => {
    try {
      return QRCodeLib.create(value, { errorCorrectionLevel });
    } catch {
      return null;
    }
  }, [value, errorCorrectionLevel]);

  if (!qrData) {
    return null;
  }

  const moduleCount = qrData.modules.size;
  const moduleSize = size / moduleCount;
  const totalSize = size;
  const circleRadius = moduleSize * (1 / 3);

  const finderPositions: [number, number][] = [
    [0, 0],
    [0, moduleCount - 7],
    [moduleCount - 7, 0],
  ];

  const finderSize = 7 * moduleSize;
  const innerPadding = moduleSize;
  const innerWhiteSize = 5 * moduleSize;
  const innerBlackSize = 3 * moduleSize;

  const circles: { cx: number; cy: number; key: string }[] = [];

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (
        qrData.modules.get(row, col) &&
        !isInFinderPattern(row, col, moduleCount)
      ) {
        circles.push({
          cx: (col + 0.5) * moduleSize,
          cy: (row + 0.5) * moduleSize,
          key: `${row}-${col}`,
        });
      }
    }
  }

  return (
    <svg
      aria-label={`QR code for ${value}`}
      className={cn("block", className)}
      height={totalSize}
      role="img"
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      width={totalSize}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>{`QR code for ${value}`}</title>
      <rect
        fill={bgColor}
        height={totalSize}
        rx="12"
        ry="12"
        width={totalSize}
      />
      {finderPositions.map(([r, c]) => {
        const x = c * moduleSize;
        const y = r * moduleSize;
        return (
          <g key={`${r}-${c}`}>
            <rect
              fill={fgColor}
              height={finderSize}
              rx="12"
              ry="12"
              width={finderSize}
              x={x}
              y={y}
            />
            <rect
              fill={bgColor}
              height={innerWhiteSize}
              rx="8"
              ry="8"
              width={innerWhiteSize}
              x={x + innerPadding}
              y={y + innerPadding}
            />
            <rect
              fill={fgColor}
              height={innerBlackSize}
              rx="3"
              ry="3"
              width={innerBlackSize}
              x={x + innerPadding * 2}
              y={y + innerPadding * 2}
            />
          </g>
        );
      })}
      {circles.map(({ cx, cy, key }) => (
        <circle cx={cx} cy={cy} fill={fgColor} key={key} r={circleRadius} />
      ))}
    </svg>
  );
}
