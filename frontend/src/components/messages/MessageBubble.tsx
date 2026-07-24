import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Message } from "@/services/messageApi";
import { MessageStatus } from "./MessageStatus";

interface MessageBubbleProps {
  message: Message;
  isSender: boolean;
  receiverAvatar: string;
  onRetry?: () => void;
}

export function MessageBubble({
  message,
  isSender,
  receiverAvatar,
  onRetry,
}: MessageBubbleProps) {
  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const isDeleted = message.message === "This message was deleted";

  return (
    <div className={cn("flex gap-2 mb-3 group", isSender ? "flex-row-reverse" : "flex-row")}>
      {!isSender && (
        <Avatar className="w-7 h-7 mt-auto">
          <AvatarImage src={receiverAvatar} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[65%] px-4 py-2 rounded-2xl",
          isSender
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted rounded-bl-sm",
        )}
      >
        {message.attachments?.map((attachment, index) =>
          attachment.type === "image" ? (
            <img
              key={index}
              src={attachment.url}
              alt={attachment.name || "Image"}
              className="rounded-lg max-h-64 mb-2 object-cover"
            />
          ) : null,
        )}

        <p className={cn("text-sm whitespace-pre-wrap break-words", isDeleted && "italic opacity-70")}>
          {message.message}
        </p>

        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isSender ? "justify-end" : "justify-start",
          )}
        >
          <p
            className={cn(
              "text-[10px]",
              isSender ? "text-primary-foreground/70" : "text-muted-foreground",
            )}
          >
            {formatTime(message.createdAt)}
          </p>
          {isSender && <MessageStatus status={message.status} className="text-primary-foreground/80" />}
          {isSender && message.status === "failed" && onRetry && (
            <button onClick={onRetry} className="text-[10px] underline opacity-80">
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
