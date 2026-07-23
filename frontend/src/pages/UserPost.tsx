import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";

import { Post } from "@/components/feed";
import { CommentDialog } from "@/components/CommentDialog";
import { RootState } from "@/store/store";
import { useGetPostByIdQuery } from "@/services/postApi";
import { Skeleton } from "@/components/ui/skeleton";

const UserPost = () => {
  const { postId } = useParams();
  const commentSt = useSelector(
    (state: RootState) => state.comment.isCommentDialogOpen,
  );

  // RTK Query hooks
  const { data: postData, isLoading } = useGetPostByIdQuery(postId);

  const post = postData?.post || {};
  const comments = post.comments || [];

  useEffect(() => {
    if (commentSt) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [commentSt]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="w-full aspect-square" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {commentSt && <CommentDialog comments={comments} postId={postId} />}
      <Post
        postId={post._id}
        userId={post.userId}
        likecount={post.likecount || 0}
        postImage={post.postImage}
        description={post.description}
        commentcount={post.commentcount}
        created={post.createdAt}
        onCommentClick={() => {}}
      />
    </div>
  );
};

export default UserPost;
