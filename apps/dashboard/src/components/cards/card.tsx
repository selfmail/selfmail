"use client"

export default function Card({
    subject,
    ref
}: {
    subject: string,
    ref?: React.RefObject<HTMLDivElement>
}) {
    return (
        <div ref={ref} className="flex flex-col gap-2 p-4 border border-border rounded-xl">
            <div className="flex">
                <input type="checkbox" className="w-4 h-4 border-border rounded-full" />
                <h2>{subject}</h2>
            </div>
        </div>
    )
}