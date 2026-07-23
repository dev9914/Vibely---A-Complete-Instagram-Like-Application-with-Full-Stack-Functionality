import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Phone,
  Video,
  Info,
  Loader2,
  Send,
  Image,
  Smile,
} from "lucide-react";
import { Socket } from "socket.io-client";
import { useAppDispatch } from "@/store/hooks";
import {
  messageApi,
  Message,
  Conversation,
} from "@/services/messageApi";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getSocket } from "@/components/socket";
import { useGetUserByIdQuery } from "@/services/userApi";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} from "@/services/messageApi";

interface ChatProps {
  userId: string;
  userAvatar: string;
  username: string;
}

// Conversation Item for Sidebar
const ConversationItem = ({
  conversation,
  isActive = false,
  isOnline = false,
}: {
  conversation: Conversation;
  isActive?: boolean;
  isOnline?: boolean;
}) => {
  const user = conversation.user;

  return (
    <Link
      to={`/chat/${user._id}`}
      className={cn(
        "flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors rounded-lg mx-2",
        isActive && "bg-muted",
      )}
    >
      <div className="relative">
        <Avatar className="w-14 h-14">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        {isOnline && (
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{user.username}</p>

        <p className="text-sm text-muted-foreground truncate">
          {conversation.lastMessage?.message || "Start chatting"}
        </p>
      </div>
    </Link>
  );
};

// Message Bubble Component
const ChatBubble = ({
  message,
  isSender,
  receiverAvatar,
  timestamp,
}: {
  message: string;
  isSender: boolean;
  senderAvatar: string;
  receiverAvatar: string;
  timestamp: string;
}) => {
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={cn(
        "flex gap-2 mb-3",
        isSender ? "flex-row-reverse" : "flex-row",
      )}
    >
      {!isSender && (
        <Avatar className="w-7 h-7 mt-auto">
          <AvatarImage src={receiverAvatar} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[60%] px-4 py-2 rounded-2xl",
          isSender
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted rounded-bl-sm",
        )}
      >
        <p className="text-sm">{message}</p>
        <p
          className={cn(
            "text-[10px] mt-1",
            isSender ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {formatTime(timestamp)}
        </p>
      </div>
    </div>
  );
};

const Chat = ({ userId, userAvatar, username }: ChatProps) => {
  const [message, setMessage] = useState("");
  const { receiverId } = useParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // RTK Query hooks
const { data: userData } = useGetUserByIdQuery(receiverId!, {
  skip: !receiverId,
});

  const { data: messagesData, isLoading: messagesLoading, isFetching: messagesFetching } =
    useGetMessagesQuery(receiverId!, {
      skip: !receiverId,
    });

  const messages = messagesData?.messages ?? [];
  const [sendMsg, { isLoading: isSending }] = useSendMessageMutation();
const dispatch = useAppDispatch();

  const user = userData?.user || null;

useEffect(() => {
  if (!userId) return;

  const socketInstance = getSocket(userId);

  setSocket(socketInstance);

  return () => {
    socketInstance.off("newMessage");
    socketInstance.off("getOnlineUsers");
  };
}, [userId]);

useEffect(() => {
  if (!socket || !receiverId) return;

  const handleNewMessage = (newMessage: Message) => {
    const senderId =
      typeof newMessage.senderId === "string"
        ? newMessage.senderId
        : newMessage.senderId._id;

    if (senderId !== receiverId) return;

    dispatch(
      messageApi.util.updateQueryData(
        "getMessages",
        receiverId,
        (draft) => {
          if (
            !draft.messages.some(
              (message) => message._id === newMessage._id
            )
          ) {
            draft.messages.push(newMessage);
          }
        }
      )
    );
  };

  const handleOnlineUsers = (users: string[]) => {
    setOnlineUsers(users);
  };

  socket.on("newMessage", handleNewMessage);
  socket.on("getOnlineUsers", handleOnlineUsers);

  return () => {
    socket.off("newMessage", handleNewMessage);
    socket.off("getOnlineUsers", handleOnlineUsers);
  };
}, [socket, receiverId, dispatch]);
  const sendMessage = async () => {
    if (message.trim() && !isSending) {
      try {
        await sendMsg({
          receiverId: receiverId!,
          message,
        }).unwrap();

        setMessage("");
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">

      {/* Chat Area */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="h-16 border-b border-border flex items-center justify-between px-4">
          <Link to={`/user/${user?._id}`} className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>
                {user?.fullName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground">
                {onlineUsers.includes(user?._id || "")
                  ? "Active now"
                  : "Offline"}
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Info className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Profile Card at Top */}
          {messages.length === 0 && (
          <div className="flex flex-col items-center py-8 px-4 border-b border-border">
            <Link to={`/user/${user?._id}`}>
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-2xl">
                  {user?.fullName?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <p className="text-lg font-semibold">{user?.fullName}</p>
            <p className="text-sm text-muted-foreground">
              {user?.username} · Vibely
            </p>
            <Link to={`/user/${user?._id}`}>
              <Button variant="secondary" size="sm" className="mt-4">
                View profile
              </Button>
            </Link>
          </div>
          )}

          <ScrollArea className="flex-1 min-h-0">
            <div className="flex min-h-0 flex-col gap-4 p-4">
              {!messagesLoading && messagesFetching && messages.length > 0 && (
                <div className="flex items-center justify-center gap-2 py-1 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating messages...
                </div>
              )}

              {messagesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-2",
                        i % 2 === 0 ? "flex-row-reverse" : "flex-row",
                      )}
                    >
                      <Skeleton className="w-7 h-7 rounded-full" />
                      <Skeleton
                        className={cn(
                          "h-10 rounded-2xl",
                          i % 2 === 0 ? "w-40" : "w-32",
                        )}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 min-h-0 space-y-3">
                  {messages.map((msg) => (
                    <ChatBubble
                      key={msg._id}
                      message={msg.message}
                      isSender={
                        typeof msg.senderId === "string"
                          ? msg.senderId === userId
                          : msg.senderId._id === userId
                      }
                      senderAvatar={userAvatar}
                      receiverAvatar={user?.avatar || ""}
                      timestamp={msg.createdAt}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <Smile className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message..."
                className="
  pl-1
    border-none
    shadow-none
    outline-none
    ring-0
    focus:ring-0
    focus-visible:ring-0
    focus-visible:ring-offset-0
    focus:border-none
    bg-transparent
  "
              />
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <Image className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 shrink-0",
                  message.trim() && "text-primary hover:text-primary/80",
                )}
                onClick={sendMessage}
                disabled={!message.trim() || isSending}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
