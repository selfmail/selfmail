/**
 * A simple keyboard shortcut component to display a keyboard shortcut
 */
export function KBD({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm bg-[#f4f4f4] text-black px-[4px] rounded-md border-b border-b-[#eeeeee] ring-1 ring-[#dddddd]">
      {children}
    </span>
  );
}
