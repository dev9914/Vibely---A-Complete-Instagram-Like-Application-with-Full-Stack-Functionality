import { Link, Outlet, useParams } from "react-router-dom";
import { Loader2, MessageCircle, PenSquare, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
  useGetConversationsQuery,
  Conversation,
} from "@/services/messageApi";

interface MessagesLayoutProps {
  user: {
    _id: string;
    username: string;
    avatar: string;
  };
}

const ConversationItem = ({
  conversation,
  isActive = false,
}: {
  conversation: Conversation;
  isActive?: boolean;
}) => {
  const chatUser = conversation.user;

  return (
    <Link
      to={`/chat/${chatUser._id}`}
      className={cn(
        "flex items-center gap-3 p-3 mx-2 rounded-lg hover:bg-muted/50 transition-colors",
        isActive && "bg-muted"
      )}
    >
      <div className="relative">
        <Avatar className="w-14 h-14">
          <AvatarImage src={chatUser.avatar} />
          <AvatarFallback>
            {chatUser.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm truncate">
            {chatUser.username}
          </p>

          {conversation.lastMessage && (
            <span className="text-xs text-muted-foreground">
              {new Date(
                conversation.lastMessage.createdAt
              ).toLocaleDateString()}
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground truncate">
          {conversation.lastMessage?.message || "Start chatting"}
        </p>
      </div>

      {conversation.unreadCount > 0 && (
        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
          {conversation.unreadCount}
        </span>
      )}
    </Link>
  );
};

const ConversationSkeleton = () => (
  <div className="flex items-center gap-3 p-3 mx-2">
    <Skeleton className="w-14 h-14 rounded-full" />
    <div className="flex-1">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  </div>
);

const MessagesLayout = ({ user }: MessagesLayoutProps) => {
  const { receiverId } = useParams();

  const { data, isLoading, isFetching } = useGetConversationsQuery();

  const conversations = data?.conversations || [];

  return (
    <div className="flex h-[calc(100vh-1px)] min-h-0">
      {/* Sidebar */}
      <div className="w-[350px] border-r border-border flex flex-col shrink-0">
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">
              {user.username}
            </h1>

            <Button variant="ghost" size="icon">
              <PenSquare className="w-5 h-5" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <Input
              placeholder="Search messages"
              className="pl-10 bg-muted border-0"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 px-5 py-3 border-b border-border">
          <button className="text-sm font-semibold">
            Messages
          </button>

          <button className="text-sm font-semibold text-primary hover:text-primary/80">
            Requests
          </button>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          <div className="py-2">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <ConversationSkeleton key={index} />
              ))
            ) : conversations.length ? (
              conversations.map((conversation) => (
                <ConversationItem
                  key={conversation._id}
                  conversation={conversation}
                  isActive={conversation.user._id === receiverId}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <MessageCircle className="h-10 w-10 text-muted-foreground mb-3" />

                <p className="font-medium">
                  No conversations yet
                </p>

                <p className="text-sm text-muted-foreground mt-1">
                  Start chatting with someone to see your conversations here.
                </p>
              </div>
            )}

            {!isLoading && isFetching && conversations.length > 0 && (
              <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Updating conversations...
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Side */}
      <div className="flex-1 min-h-0 h-full">
        <Outlet />
      </div>
    </div>
  );
};

export default MessagesLayout;