import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaFacebookMessenger } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { PiNotePencilDuotone } from "react-icons/pi";

const Messages = ({user}) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [allUser, setAllUser] = useState([]);

  useEffect(() => {
    getAlluser();
  },[]);

  const fileterMe = allUser.filter((item)=> item._id !== user._id)

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
  return (
    <div className="flex">
    <div   style={{
    scrollbarWidth: "none", /* Firefox */
    msOverflowStyle: "none", /* IE and Edge */
  }} className="w-96 border-r h-screen border-gray-500 border-opacity-40 overflow-x-hidden overflow-y-auto">
            <div className="flex ml-7 mr-5 mt-10 mb-5 justify-between text-white font-sans font-semibold">
          <div className="text-xl font-bold">{user.username}</div>
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
         <div key={item._id} className='flex mb-4 items-center'>
         <div className='cursor-pointer'>
           {/* <Link to={`/user/${_id}`}> */}
           <img src={item.avatar} className="rounded-full border border-gray-600 cursor-pointer w-14 h-14" alt="" />
           {/* </Link> */}
         </div>
         <div className="flex ml-3 flex-col">
         {/* <Link to={`/user/${_id}`}> */}
         <p className='cursor-pointer text-sm font-semibold -mt-1 font-sans'>{item.username}</p>
         {/* </Link> */}
         <p className='-mt-1 opacity-50 text-sm'>{item.fullName}</p>
         </div>
       </div> 
            </Link>
        ))}
      </div>
    </div>
    <div className="text-white flex-grow">
      <div className="flex  h-screen flex-col justify-center items-center">
      <FaFacebookMessenger size={50} className="mb-5" />
        <p className="text-xl font-sans">Your messages</p>
        <p className="text-gray-400">send a message to start a chat</p>
        <Button size={'sm'} className="cursor-pointer hover:bg-blue-600 bg-blue-500 mt-2">Send message</Button>
      </div>
    </div>
    </div>
  );
};

export default Messages;
