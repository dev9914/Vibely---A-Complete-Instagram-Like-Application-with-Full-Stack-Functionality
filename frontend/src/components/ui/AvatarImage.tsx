import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "./avatar"

  interface avatartprop {
    avatar: string
    size: string
  }
   
  export function AvatarDemo({avatar,size}:avatartprop) {
    return (
      <Avatar className={`${size? `w-7 h-7`:''} rounded-full overflow-hidden`}>
        <AvatarImage src={avatar} className="object-cover w-full h-full" sizes="true" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    )
  }