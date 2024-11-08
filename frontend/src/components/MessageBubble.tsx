import clsx from 'clsx';

interface MessageBubbleProp {
    message: string,
    isSender: boolean,
    sentAt: string,
    receiverAvatar: string,
    userAvatar: string
}

const MessageBubble = ({ message, isSender, sentAt, receiverAvatar, userAvatar }: MessageBubbleProp) => {
  const chatClassName = isSender ? 'chat-end' : 'chat-start';
  const bubbleBgColor = isSender ? 'bg-blue-500' : "";
  const profilePic = isSender ? userAvatar : receiverAvatar;

  function timeAgo(createdAt:string) {
    const createdTime = new Date(createdAt);
    const currentTime = new Date();
    const timeDifference = Math.floor((currentTime - createdTime) / 1000); // Difference in seconds
  
    const minutes = Math.floor(timeDifference / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
  
    if (days > 0) {
      return days + (days === 1 ? "d" : "d");
    } else if (hours > 0) {
      return hours + (hours === 1 ? "h" : "h");
    } else if (minutes > 0) {
      return minutes + (minutes === 1 ? "m" : "m");
    } else {
      return "just now";
    }
  }
  const timesent = timeAgo(sentAt)
  return (
    <div className={`chat ${chatClassName} mr-4`}>
      <div className='chat-image avatar'>
        <div className='w-10 rounded-full'>
        <img  src={profilePic} alt="avatar" />
        </div>
      </div>
      <div className={`chat-bubble text-white ${bubbleBgColor} pb-2`}>{message}</div>
      <div className='chat-footer opacity-50 text-xs flex gap-1 items-center'>{timesent}</div>
    </div>
  )
};

export default MessageBubble;