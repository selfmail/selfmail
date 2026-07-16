import { ChartArea } from "lucide-react";

export default function BottomBar() {
  return (
    <div className="pointer-events-none fixed bottom-0 flex h-16 w-full items-center justify-center">
      <div className="pointer-events-auto rounded-full border border-border bg-muted px-4 py-2">
        <ChartArea />
      </div>
    </div>
  );
}
