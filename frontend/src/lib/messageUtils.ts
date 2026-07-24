import type { Message } from "@/services/messageApi";

export const getMessageUserId = (
  user: string | { _id: string },
): string => (typeof user === "string" ? user : user._id);

export const isSameMessage = (a: Message, b: Message): boolean => {
  if (a._id === b._id) return true;
  if (a.clientId && b.clientId && a.clientId === b.clientId) return true;
  return false;
};

export const messageExistsInList = (
  messages: Message[],
  incoming: Message,
): boolean => messages.some((m) => isSameMessage(m, incoming));
