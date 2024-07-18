"use client"
import Img from "next/image"
import { useRouter } from "next/navigation"
import { KeyboardEventHandler, MouseEventHandler } from "react"

/**
 * A card for a post.
 */
export default function PostCard({
    title,
    description,
    date,
    image,
    content,
    id
}: {
    id: string
    title: string,
    description: string,
    date: Date,
    image?: string |null,
    content: string
}) {
    console.log(image)
    const router = useRouter()
    function handleClick() {
        router.push(`/help/${id}`)
    }
    return (
        <div className="border border-[#cccccc] p-2 rounded-md cursor-pointer" onClick={handleClick} onKeyDown={handleClick}>
            { image != (null || undefined) && image != "null" && (
                <Img src={image || ""} alt={description} width={1000} height={1000} />
            ) }
            <h2 className="text-xl">{title}</h2>
            <p className="text-[#666666]">{description}</p>
        </div>
    )
}