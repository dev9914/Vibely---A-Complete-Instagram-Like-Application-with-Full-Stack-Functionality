import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { IoCallOutline, IoVideocamOutline } from "react-icons/io5";
import { RxDotFilled, RxInfoCircled } from "react-icons/rx";
import MessageBubble from "../components/MessageBubble";
import { Button } from "../components/ui/button";
import {PiNotePencilDuotone } from "react-icons/pi";
import { getSocket } from "../components/socket";
import { Socket } from "socket.io-client";
import { GoDotFill } from "react-icons/go";

interface ChatProps {
  userId: string,
  userAvatar: string,
  username: string
}
type Message = {
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  _id: string;
};

interface Item {
  _id: string,
  username: string,
  avatar: string,
  fullName: string
}

interface User {
  _id: string,
  username: string,
  avatar: string,
  fullName: string
}


const Chat = ({ userId, userAvatar, username }: ChatProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const { receiverId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers , setOnlineUsers] = useState<string[]>([])

  useEffect(() => {
    if (userId) {
      // Initialize socket
      const socketInstance = getSocket(userId);
      setSocket(socketInstance);
  
      return () => {
        if (socket) {
          socket.disconnect();
          console.log("Socket disconnected");
        }
      };
    }
  }, [userId]); // 

  const getuser = async ()=>{
    try {
      const response = await axios.get(`${apiUrl}/users/getuserbyId/${receiverId}`)


    console.log(response.data.data.user)
    setUser(response.data.data.user)
    } catch (error) {
    console.log(error)
    }
  }

  const apiUrl = import.meta.env.VITE_API_URL;
  const [allUser, setAllUser] = useState<Item[]>([]);

  const fileterMe: Item[] = allUser.filter((item)=> item._id !== userId)

  useEffect(() => {
    getAlluser();
  }, []);

  const getAlluser = async () => {
    try {
      const response = await axios.get(`${apiUrl}/users/getalluser`);
      // console.log(response.data.data.alluser)
      setAllUser(response.data.data.alluser);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // Fetch previous messages
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/message/get/${receiverId}`,
          { headers: { Authorization: localStorage.getItem("token") } }
        );
        console.log(response.data)
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();

    getuser()

    // Listen for new messages
    socket?.on("newMessage", (newMessage): any => {
      console.log(newMessage)
      if(receiverId === newMessage.senderId) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    socket?.on('getOnlineUsers', (data): any => {
      console.log('online users: ', data)
      setOnlineUsers(data)
    })

    // Clean up the socket connection on unmount
    return () => {
      socket?.off("newMessage");
    };
  }, [receiverId,socket]);

  const sendMessage = async () => {
    if (message.trim()) {
      try {
        const response = await axios.post(
          `${apiUrl}/message/send/${receiverId}`,
          { message },
          { headers: { Authorization: localStorage.getItem("token") } }
        );
        setMessage(""); // Clear input
        setMessages((prevMessages) => [...prevMessages, response.data]);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevents any unintended behavior from Enter key
      sendMessage(); // Call sendMessage when Enter is pressed
    }
  };

  return (
    <div className="flex">
      <div
        style={{
          scrollbarWidth: "none" /* Firefox */,
          msOverflowStyle: "none" /* IE and Edge */,
        }}
        className="w-96 border-r h-screen border-gray-500 border-opacity-40 overflow-x-hidden overflow-y-auto"
      >
        <div className="flex ml-7 mr-5 mt-10 mb-5 justify-between text-white font-sans font-semibold">
          <div className="text-xl font-bold">{username}</div>
          <div><PiNotePencilDuotone size={30} />
</div>
        </div>
        <div className="text-white ml-7 mr-5 font-sans font-semibold flex justify-between">
          <p className="font-bold">Messages</p>
          <p className="text-blue-500">Request</p>
        </div>
        <div className="ml-7 mt-3 text-white">
          {fileterMe.map((item) => (
            <Link to={`/chat/${item._id}`}>
              <div key={item._id} className="flex mb-4 items-center">
                <div className="cursor-pointer">
                  {/* <Link to={`/user/${_id}`}> */}
                  <img
                    src={item.avatar}
                    className="rounded-full border border-gray-600 cursor-pointer w-14 h-14"
                    alt=""
                  />
                  {
                    onlineUsers.includes(item._id) && (
                      <GoDotFill className="text-green-600 -mt-5 ml-10 text-xl" />
                    )
                  }
                  {/* </Link> */}
                </div>
                <div className="flex ml-3 flex-col">
                  {/* <Link to={`/user/${_id}`}> */}
                  <p className="cursor-pointer text-sm font-semibold -mt-1 font-sans">
                    {item.username}
                  </p>
                  {/* </Link> */}
                  <p className="-mt-1 opacity-50 text-sm">{item.fullName}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="text-white flex-grow">
        <div className="chat-container">
          <div>
            <div className="border-b flex justify-between border-gray-500 border-opacity-40">
          <div className="flex mb-4 ml-4 text-white items-center">
                <div className="cursor-pointer mt-3">
                  <Link to={`/user/${user?._id}`}>
                  <img
                    src={user?.avatar}
                    className="rounded-full border border-gray-600 cursor-pointer w-12 h-12"
                    alt=""
                  />
                  </Link>
                </div>
                <div className="flex ml-3 flex-col">
                  <Link to={`/user/${user?._id}`}>
                  <p className="font-sans mt-2 font-semibold tracking-wide">{user?.fullName}</p>
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-3 mr-3 justify-end">
              <IoCallOutline className="cursor-pointer" size={30} />
              <IoVideocamOutline className="cursor-pointer" size={30} />
              <RxInfoCircled className="cursor-pointer" size={28} />
              </div>
            </div>
          </div>
          <div style={{height:"77vh"}} className="mt-3 overflow-y-auto ml-4">
            <div className="flex flex-col w-full mt-5 items-center">
            <div className="">
            <Link to={`/user/${user?._id}`}>
            <img src={user?.avatar} className="rounded-full border border-gray-600 cursor-pointer w-24 h-24" alt="" />
            </Link>
          </div>
            <p className=" text-xl font-sans font-semibold mt-1">{user?.fullName}</p>
            <div className="text-sm mt-1 flex text-gray-400 opacity-65"><p>{user?.username}</p><RxDotFilled size={10} className="text-gray-100 mt-2 opacity-60" /><p>Vibely</p></div>
            <Link to={`/user/${user?._id}`}>
            <Button size={'sm'} style={{background:'#262626'}} className="cursor-pointer mt-4">View profile</Button>
            </Link>
            </div>
          {messages.map((msg) => (
        <MessageBubble
          key={msg._id}
          sentAt={msg.createdAt}
          message={msg.message}           // Pass message text as a prop
          isSender={msg.senderId === userId}
          receiverAvatar={user?.avatar}
          userAvatar={userAvatar}
        />
      ))}
      <div ref={messagesEndRef} />
          </div>
          <div className="fixed flex space-x-2 bottom-5 mx-3">
          <div className="absolute flex items-center border border-gray-400 border-opacity-40 rounded-full bottom-0">
        <input
          type="text"
          value={message}
          onChange={(e)=> setMessage(e.target.value)}
          style={{ width: '53.5vw' ,color: 'white'}}
          onKeyDown={handleKeyDown}
          className="bg-black ml-3 h-9 text-white placeholder:text-gray-500 focus:outline-none "
          placeholder="Message..."
          name=""
          id=""
        />
        <p
         onClick={()=> sendMessage()}
         className={`${
          !message ? 'text-gray-500' : 'text-blue-500 font-semibold'
        } ml-3 mr-5 cursor-pointer`}
        >
          Post
        </p>
      </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Chat;
