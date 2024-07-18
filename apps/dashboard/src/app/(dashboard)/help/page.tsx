import { db } from "database"
import PostCard from "./post-card"

export default async function HelpPage() {
    /**
     * The first 20 posts in the db
     */
    const posts = await db.helpPost.findMany({
        take: 20
    })

    return (
        <div className="flex flex-col h-screen pt-3 mx-3">
            <h1 className="text-4xl font-bold">Help center</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-3 gap-4">
                { posts.length !== 0 && (
                    posts.map((post) => (
                        <PostCard key={post.id} id={post.id} date={post.createdAt} description={post.content} content={post.content} title={post.title} image={post.image} />
                    ))
                ) || (<p className="text-red-700">We had an error: there are no posts. For help, please contact us.</p>) }
            </div>
        </div>
    )
}