import { checkRequest } from "@/server/checkRequest";
import { db } from "database";
import { ChevronLeft, Pen, Trash } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import TrashButton from "./trash-button";
import { Button, Dialog, DialogContent, DialogTrigger, Input } from "ui";
import { z } from "zod";
import { userAgent } from "next/server";
import ModDeletionModal from "./mod-deletion-form";
import CreateCommandForm from "./create-command";

/**
 * View a community article or guide.
 */
export default async function Help({
  params,
}: {
  params: {
    id: string;
  };
}) {
  if (!params.id) notFound();
  // the user from the session
  const req = await checkRequest();
  // the user in the db
  const user = await db.user.findUnique({
    where: {
      id: req.userId,
    },
  });
  // no user is matching with the id in the cookies
  if (!user) redirect("/login");

  const article = await db.helpPost.findUnique({
    where: {
      id: params.id,
    },
  });
  if (!article) notFound();
  const articleUser = await db.user.findUnique({
    where: {
      id: article.userId,
    },
  });
  if (!articleUser) throw new Error("The author of this post can't be found.");

  // fetch the comments
  let comments: {
    id: string;
    content: string;
    userId: string;
    postId: string;
  }[] = [] as {
    id: string;
    content: string;
    userId: string;
    postId: string;
  }[];
  if (article.allowComments) {
    const dbComments = await db.comment.findMany({
      where: {
        postId: article.id,
      },
    });
    comments = dbComments;
  }
  return (
    <div className="mx-3 mt-3">
      <div className="flex items-center justify-between">
        <Link href="/help">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center space-x-3">
          <p>
            {article.createdAt.toLocaleDateString()}{" "}
            {article.createdAt.toLocaleTimeString()}
          </p>
          {/* User is a mod, he can now also moderat this post. If this post is from another mod or admin, he can't
                        edit this post.
                     */}
          {user.role === ("mod" || "admin") && articleUser.role !== "mod" && (
            <>
              {/* Deletion of a post can be only handled with a reason. When
                                a post is deleted, it will be saved into another model. If the 
                                deletion is approved, it will be permanentely deleted. */}
              <Dialog>
                <DialogTrigger>Delete</DialogTrigger>
                <DialogContent>
                  <ModDeletionModal
                    modId={user.id}
                    postId={article.id}
                    userId={articleUser.id}
                  />
                </DialogContent>
              </Dialog>
            </>
          )}
          {/* Edit the article */}
          {user.id === article.userId && (
            <>
              <TrashButton id={article.id} />
              <Pen className="h-4 w-4" />
            </>
          )}
        </div>
      </div>
      <h1 className="text-4xl font-medium">{article.title}</h1>
      <p className="text-[#666666]">{article.description}</p>
      <hr />
      <p>{article.content}</p>
      {/* The comment system */}
      {article.allowComments && (
        <>
          <hr />
          <div>
            <h2 className="text-2xl font-medium">Comments</h2>
            {/* Show the comments */}
            {comments.map((comment) => (
              <div>{comment.content}</div>
            ))}
            {/* Create a new comment */}
            <CreateCommandForm />
          </div>
        </>
      )}
    </div>
  );
}
