import { db } from "database";
import PostCard from "./post-card";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function HelpPage() {
  //TODO: implement pagniation
  /**
   * The first 20 posts in the db
   */
  const posts = await db.helpPost.findMany({
    take: 20,
  });

  return (
    <div className="mx-3 flex h-screen flex-col pt-3">
      <div className="flex justify-between">
        <h1 className="text-4xl font-bold">Help center</h1>
        <Link href="/help/new">
          <Plus className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(posts.length !== 0 &&
          posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              date={post.createdAt}
              description={post.description}
              content={post.content}
              title={post.title}
              image={post.image}
            />
          ))) || (
          <p className="text-red-700">
            We had an error: there are no posts. For help, please contact us.
          </p>
        )}
      </div>
    </div>
  );
}
