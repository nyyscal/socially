"use client"

import { createComment, deletePost, getPosts, toggleLike } from "@/actions/post.action"
import { SignInButton, useUser } from "@clerk/nextjs"
import { useState } from "react"
import toast from "react-hot-toast"
import { Button } from "./ui/button"
import { HeartIcon, LogInIcon, MessageCircleIcon, SendIcon } from "lucide-react"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"
import { Textarea } from "./ui/textarea"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Card, CardContent } from "./ui/card"
import { DeleteAlertDialog } from "./DeleteAlertDialog"

type Posts = Awaited<ReturnType<typeof getPosts>>
type Post = Posts[number]

const PostCard = ({ post, dbUserId }: { post: Post; dbUserId: string | null }) => {
  const { user } = useUser()
  const [newComment, setNewComment] = useState("")
  const [showComments, setShowComments] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasLiked, setHasLiked] = useState(post.likes.some((like) => like.userId === dbUserId))
  const [optimisticLikes, setOptimisticLikes] = useState(post._count.likes)

  const handleLike = async () => {
    if (isLiking) return
    try {
      setIsLiking(true)
      setHasLiked((prev) => !prev)
      setOptimisticLikes((prev) => prev + (hasLiked ? -1 : 1))
      await toggleLike(post.id)
    } catch (error) {
      setOptimisticLikes(post._count.likes)
      setHasLiked(post.likes.some((like) => like.userId === dbUserId))
    } finally {
      setIsLiking(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return
    try {
      setIsCommenting(true)
      const result = await createComment(post.id, newComment)
      if (result?.success) {
        toast.success("Comment posted successfully")
        setNewComment("")
      }
    } catch (error) {
      toast.error("Failed to add comment")
    } finally {
      setIsCommenting(false)
    }
  }

  const handleDeletePost = async () => {
    if (isDeleting) return
    try {
      setIsDeleting(true)
      const result = await deletePost(post.id)
      if (result.success) toast.success("Post deleted successfully")
      else throw new Error(result.error)
    } catch (error) {
      toast.error("Failed to delete post")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="overflow-hidden border border-border shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* HEADER */}
          <div className="flex gap-3 sm:gap-4">
          {/* POST AUTHOR AVATAR */}
{/* POST AUTHOR AVATAR */}
<Link href={`/profile/${post.author.username}`} className="hover:opacity-80 transition">
  <Avatar className="w-2 h-2 rounded-full border">
    <AvatarImage src={post.author.image ?? "/avatar.png"} className="rounded-full" />
  </Avatar>
</Link>


            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 truncate">
                  <Link
                    href={`/profile/${post.author.username}`}
                    className="font-semibold text-foreground truncate hover:underline"
                  >
                    {post.author.name}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Link
                      href={`/profile/${post.author.username}`}
                      className="hover:underline"
                    >
                      @{post.author.username}
                    </Link>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                  </div>
                </div>
                {dbUserId === post.author.id && (
                  <DeleteAlertDialog isDeleting={isDeleting} onDelete={handleDeletePost} />
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground break-words">
                {post.content}
              </p>
            </div>
          </div>

          {/* POST IMAGE */}
          {post.image && (
            <div className="rounded-xl overflow-hidden border">
              <img
                src={post.image}
                alt="Post content"
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex items-center pt-2 gap-4">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={isLiking}
                className={`gap-2 ${
                  hasLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"
                }`}
                onClick={handleLike}
              >
                <HeartIcon className={`size-5 ${hasLiked ? "fill-current" : ""}`} />
                <span>{optimisticLikes}</span>
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
                  <HeartIcon className="size-5" />
                  <span>{optimisticLikes}</span>
                </Button>
              </SignInButton>
            )}

            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 text-muted-foreground hover:text-blue-500 ${
                showComments ? "text-blue-500" : ""
              }`}
              onClick={() => setShowComments((prev) => !prev)}
            >
              <MessageCircleIcon className={`size-5 ${showComments ? "fill-blue-500" : ""}`} />
              <span>{post.comments.length}</span>
            </Button>
          </div>

          {/* COMMENTS */}
          {showComments && (
            <div className="pt-4 border-t border-border space-y-4">
              {post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.author.image ?? "/avatar.png"} />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 text-sm">
                        <span className="font-medium">{comment.author.name}</span>
                        <span className="text-muted-foreground">@{comment.author.username}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt))} ago
                        </span>
                      </div>
                      <p className="text-sm text-foreground break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet</p>
              )}

              {/* COMMENT BOX */}
              {user ? (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.imageUrl || "/avatar.png"} />
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[60px] resize-none rounded-lg"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        className="gap-2"
                        disabled={!newComment.trim() || isCommenting}
                      >
                        {isCommenting ? "Posting..." : <><SendIcon className="size-4" /> Comment</>}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center p-4 border rounded-lg bg-muted/50">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="gap-2">
                      <LogInIcon className="size-4" />
                      Sign in to comment
                    </Button>
                  </SignInButton>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PostCard
