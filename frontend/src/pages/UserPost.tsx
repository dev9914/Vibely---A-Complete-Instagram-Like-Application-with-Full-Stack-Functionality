import { useParams } from 'react-router-dom'
import Post from '../components/Post'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { no } from "../store/commentSlice"
import { Link } from 'react-router-dom'
import { AvatarDemo } from '../components/ui/AvatarImage'

const UserPost = () => {
    const {postId} = useParams()
    const apiUrl = import.meta.env.VITE_API_URL;
    const [post, setPost] = useState({})
    const [commentText, setCommentText] = useState('')
    const [comments, setComment] = useState([])
    const commentSt = useSelector((state: RootState)=> state.comment.status)

    const dispatch = useDispatch()

    useEffect(()=>{
        getPostDetails()
        if(commentSt) {
          document.body.style.overflow = 'hidden';
        }  else {
          document.body.style.overflow = 'auto';
          document.body.style.overflowX= 'hidden' // Restore scrolling
        }
      
        // Optional cleanup to ensure no side effects
        return () => {
          document.body.style.overflow = 'auto'; // Restore scrolling on component unmount or effect cleanup
        };
      },[commentSt])

    const getPostDetails = async () => {
        const response = await axios.get(`${apiUrl}/post/getpostbyId/${postId}`)

        // console.log(response.data.data.post)
        setPost(response.data.data.post)
        return response.data
    }

    const getComments = async () => {
        try {
          const response = await axios.get(`${apiUrl}/post/getpostbyId/${postId}`)
    
          // console.log(response.data.data.post.comments)
          setComment(response.data.data.post.comments)
          return response.data
        } catch (error) {
          console.log(error)
        }
      }

      const addComment = async ()=> {
        try {
          const response = await axios.put(`${apiUrl}/post/comment/${postId}`, {text: commentText}, {headers: {Authorization: localStorage.getItem('token')}})
    
          // console.log(response.data.data.updatedpost.comments)
          setComment(response.data.data.updatedpost.comments)
          setCommentText('')
          return response.data
        } catch (error) {
          console.log(error)
        }
      }

      const handleComment = () => {
        getComments()
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

  return (
    <div className='text-white w-full mt-5 flex ml-28'>
           {commentSt && (
  <div className="">
    <div
      onClick={() => dispatch(no())}
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
        zIndex: 1,
      }}
    ></div>
    <div
      style={{ left: '58vw' }}
      className="fixed text-white bg-black border border-gray-500 border-opacity-40 w-1/3 h-3/5 top-32 z-20"
    >
      <div  style={{
          overflowY: 'scroll', // Enable vertical scrolling
          height: 'calc(100% - 3rem)', // Adjust height to allow for the input box
          paddingBottom: '2.5rem', // Space for the input box
          scrollbarWidth: 'none', // Hide scrollbar for Firefox
          msOverflowStyle: 'none', // Hide scrollbar for IE and Edge
        }} className="overflow-y-auto mx-4 mt-3 h-96 pb-10">
          {!(comments.length === 0) ? (
             comments.map((item) => (
              <div className="flex mb-5" key={item.userId}>
                <div className="">
                  <div onClick={() => dispatch(no())} className="cursor-pointer">
                    <Link to={`/user/${item.userId}`}>
                      <AvatarDemo avatar={item?.avatar} />
                    </Link>
                  </div>
                </div>
                <div>
                  <div className="flex">
                    <div onClick={() => dispatch(no())} className="">
                    <Link to={`/user/${item.userId}`}>
                      <p className="ml-3 font-semibold font-sans cursor-pointer">
                        {item.username}
                      </p>
                    </Link>
                    </div>
                    <p className="opacity-90 ml-2 font-thin">{item.text}</p>
                  </div>
                  <p className="text-gray-200 opacity-45 text-xs ml-3 font-sans">
                    {timeAgo(item.createdAt)}
                  </p>
                </div>
              </div>
            ))
          ): (
            <div className="text-white">
              <div className="mt-40 ml-20">
              <h1 className="font-bold opacity-95 font-sans text-3xl">
              No comments yet.
              </h1>
              <p className="text-gray-500 ml-11 font-sans">Start the conversation.</p>
              </div>
              </div>
          )}
       
      </div>
      <div className="absolute bottom-0 flex">
        <input
          type="text"
          onChange={(e) => setCommentText(e.target.value)}
          style={{ width: '28.5vw' }}
          value={commentText}
          className="bg-black ml-3 mb-3 placeholder:text-gray-500 focus:outline-none focus:border-transparent"
          placeholder="Add a comment..."
          name=""
          id=""
        />
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
)}
      <Post CommentButton={handleComment} postId={post._id} key={post._id || Math.random()} userId={post.userId} likecount={post.likecount || 0} postImage={post.postImage} description={post.description} commentcount={post.commentcount} created={post.createdAt} />
    </div>
  )
}

export default UserPost
