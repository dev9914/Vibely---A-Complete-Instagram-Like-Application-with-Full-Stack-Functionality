import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

const MessageHome = () => {
  return (
    <div className="flex-1 w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center max-w-sm px-6">
        <div className="w-24 h-24 rounded-full border-2 border-foreground flex items-center justify-center mb-4">
          <MessageCircle className="w-12 h-12" />
        </div>

        <h2 className="text-2xl font-light mb-2">
          Your messages
        </h2>

        <p className="text-muted-foreground mb-5">
          Send a message to start a chat.
        </p>

        <Button>
          Send message
        </Button>
      </div>
    </div>
  );
};

export default MessageHome;