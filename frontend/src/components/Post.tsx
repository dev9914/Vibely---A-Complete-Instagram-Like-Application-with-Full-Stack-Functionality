import {AvatarDemo} from './ui/AvatarImage'
import { RxDotFilled } from "react-icons/rx";
import { RxDotsHorizontal } from "react-icons/rx";
import { AiOutlineHeart } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa6";
import { FiSend } from "react-icons/fi";
import { FaRegBookmark } from "react-icons/fa";
import axios from "axios"
import { useEffect, useState } from 'react';
import { FaHeart } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { yes } from '../store/commentSlice';
// import { AiFillHeart } from "react-icons/ai";

interface postProps {
    likecount: string,
    commentcount: string,
    userPic: string,
    postImage: string,
    description: string,
    userId: string,
    created: string,
    postId: string,
    CommentButton: ()=> void
}

const Post = ({likecount, commentcount, userId, postImage, description,created, postId, CommentButton}: postProps) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [user,setUser] = useState('')
  const [post, setPost] = useState('')
  const [updatedLike, setUpdatedLike] = useState('')
  const [checklike, setCheckLike] = useState(Boolean)
  const [commentText, setCommentText] = useState('')
  const dispatch = useDispatch()

  useEffect(()=>{
    getuser()
    checkifLiked()
  },[checklike])

  const getuser = async ()=>{
    try {
      const response = await axios.get(`${apiUrl}/users/getuserbyId/${userId}`)


      // console.log(response.data.data.user.fullName)
      setUser(response.data.data.user)
      // setProfilePic(response.data.data.user.avatar)
    } catch (error) {
    console.log(error)
    }
  }

  const addLike = async ()=> {
    const response = await axios.put(`${apiUrl}/post/like/${post}`,{},{headers:{Authorization: localStorage.getItem('token')}})

    // console.log(response.data.data.post.likecount)
    setUpdatedLike(response.data.data.post.likecount)
    checkifLiked()
    return response.data
  }


  const checkifLiked = async ()=> {
    const response = await axios.get(`${apiUrl}/post/checkifliked/${postId}`,{headers:{Authorization: localStorage.getItem('token')}})

    // console.log(response.data.data.liked)
    setCheckLike(response.data.data.liked)
    return response.data
  }

  const addComment = async ()=> {
    try {
      const response = await axios.put(`${apiUrl}/post/comment/${postId}`, {text: commentText}, {headers: {Authorization: localStorage.getItem('token')}})

      // console.log(response.data.data.updatedpost.comments)
      setCommentText('')
      return response.data
    } catch (error) {
      console.log(error)
    }
  }

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
  
  const timeuploaded = timeAgo(created)
  
  return (
    <div onMouseEnter={()=> setPost(postId)} className="text-white border-b mb-4 border-opacity-40 border-gray-500">
      <div>
      <div className="flex items-center justify-between">
  <div className="flex items-center">
    <div className="cursor-pointer">
      <Link to={`/user/${user._id}`}>
        <AvatarDemo avatar={user.avatar} />
      </Link>
    </div>
    <Link to={`/user/${user._id}`}>
      <p className="ml-3 cursor-pointer">{user.username}</p>
    </Link>
    <RxDotFilled className="text-gray-100 opacity-60 ml-2" />
    <p className="text-gray-200 opacity-45 font-sans ml-2">{timeuploaded}</p>
  </div>

  <RxDotsHorizontal className="text-xl mr-2 cursor-pointer" />
</div> 
        <div>
          <img src={postImage?.[0]} style={{width:'34.9vw', height:'75vh',objectFit:'contain'}} alt="" className='mt-4 cursor-pointer border border-gray-500 border-opacity-40 w-80'  />
        </div>
        <div className='mt-3'>
          <div className='flex space-x-4'>
            {checklike == false ? (
               <AiOutlineHeart onClick={()=>addLike()} className='cursor-pointer' size={30} />
            ): (
              <FaHeart onClick={()=>addLike()} className='cursor-pointer text-red-600' size={30} />
            )}
          <FaRegComment onClick={()=>{ dispatch(yes()); CommentButton()}} className='cursor-pointer' size={28}/>
          <FiSend className='cursor-pointer' size={28}/>
          <FaRegBookmark className='cursor-pointer' style={{marginLeft:"390px"}} size={27}/>
          {/* <AiFillHeart /> */}
          </div>
          <p className='font-sans font-semibold mt-2'>{updatedLike || likecount} likes</p>
          <div className='flex'>
            <p><span className='font-bold mr-1'>{user.username}</span>{description}</p>
              </div>
          <p onClick={()=> dispatch(yes())} className='text-gray-500 mt-2 cursor-pointer'>{commentcount === '0' ? '': `view all ${commentcount} comments`}</p>
          <div className='flex'>
          <input onChange={(e) => setCommentText(e.target.value)} value={commentText} style={{width:'31vw'}} type="text" className='bg-black mb-3 placeholder:text-gray-500 focus:outline-none focus:border-transparent' placeholder='Add a comment...' name="" id="" />
          <p
          onClick={() => addComment()}
          className={`${
            !commentText ? 'text-gray-500' : 'text-blue-500 font-semibold'
          } ml-3 cursor-pointer`}
        >
          Post
        </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Post
