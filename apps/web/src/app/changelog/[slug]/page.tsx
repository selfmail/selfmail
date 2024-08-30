import { allChangelogs } from "content-collections"
import { notFound } from "next/navigation"

export default function ChangelogPost({
    params
}: {
    params: {
        slug: string
    }
}) {

    const post = allChangelogs.find((post) => post._meta.fileName === params.slug)

    if (!post) notFound()

    return (
        <div>
            <h1>{post.title}</h1>
            <p>{post.summary}</p>

        </div>
    )
}