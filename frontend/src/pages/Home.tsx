import { useEffect, useState } from "react"
import Post from "../components/Post"
import axios from "axios"
import {AvatarDemo} from '../components/ui/AvatarImage'
import Usersforfollow from "../components/Usersforfollow"
import { CardWithForm } from '../components/Card'
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../store/store"
import {closed } from "../store/uploadpicSlice"
import { Link } from "react-router-dom"
import { no } from "../store/commentSlice"
import { SkeletonCard } from "../components/PostSkeleton"
import { SkeletonDemo } from "../components/UserSkeleton"


const Home = ({user}) => {
  const [allPosts,setAllPosts] = useState([])
  const apiUrl = import.meta.env.VITE_API_URL;
  const [allUser, setAllUser] = useState([])
  const [seeAll, setSeeAll] = useState(false)
  const [postId, setPostId] = useState('')
  const commentSt = useSelector((state: RootState)=> state.comment.status)
  const [comments, setComment] = useState([])
  const [commentText, setCommentText] = useState('')

  const [page, setPage] = useState(1); // Start at page 1
  const [loading, setLoading] = useState(false); // Loading state
  const [hasMore, setHasMore] = useState(true); // To track if there are more posts


  const dispatch = useDispatch()

  const createpost = useSelector((state: RootState)=> state.upload.status)

  const only5user = allUser.slice(0,5).filter((item)=> item._id !== user._id)


  const only7user = allUser.slice(0,7).filter((item)=> item._id !== user._id)



  useEffect(()=>{
    getAllPosts()
    getAlluser()
    if(createpost || commentSt) {
      document.body.style.overflow = 'hidden';
    }  else {
      document.body.style.overflow = 'auto';
      document.body.style.overflowX= 'hidden' // Restore scrolling
    }
  
    // Optional cleanup to ensure no side effects
    return () => {
      document.body.style.overflow = 'auto'; // Restore scrolling on component unmount or effect cleanup
    };
  },[createpost, commentSt])

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 10 &&
        hasMore &&
        !loading
      ) {
        console.log('At bottom → fetching more posts...');
        getAllPosts();
      }
    };
  
    window.addEventListener('scroll', handleScroll);
  
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, loading, page]);
  


  const getAllPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/post/getallpost?page=${page}`);
      const newPosts = response.data.data.post;
  
      setAllPosts((prevPosts) => [...prevPosts, ...newPosts]);
  
      if (newPosts.length < 10) {
        setHasMore(false); // No more posts to fetch
      }
  
      setPage((prevPage) => prevPage + 1); // Increment page only once after success
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getAlluser = async ()=>{
    try {
      const response = await axios.get(`${apiUrl}/users/getalluser`)
      // console.log(response.data.data.alluser)
      setAllUser(response.data.data.alluser.filter((item)=> item._id !== user._id ))
      return response.data
    } catch (error) {
    console.log(error)
    }
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

  const handleComment = () => {
    getComments()
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
    <div className='bg-black flex justify-center'>
      {createpost && (
            <div className="">
            <div onClick={()=> dispatch(closed())} style={{
position: 'fixed',
top: '0',
left: '0',
width:'100%',
height: '100%',
backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
zIndex: 1,
}} >
</div>
<div className='fixed top-1/4 left-1/3 z-20'>
<CardWithForm />
</div>
</div>
      )}
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
      <div id="post-container" className="bg-black w-5/12">
        <div className="flex space-x-5 mt-8">
          {only7user.map((item,index)=>(
          <div key={index} className="">
            <Link to={`/user/${item._id}`}>
            <img src={item.avatar} className="rounded-full border border-gray-600 cursor-pointer w-14 h-14" alt="" />
            <p className="ml-1 text-xs mt-1 text-gray-400">{item.username.slice(0,7)} {item.username.length > 8 ? '...' : ''}</p>
            </Link>
          </div>
            
          ))}
        </div>
        <div className="mt-8 h-auto">
        {allPosts.length === 0 && loading ? (
          // Display skeleton loaders when posts are being fetched
          <>
            <div className="mb-10">
              <SkeletonCard />
            </div>
            <SkeletonCard />
          </>
        ) : (
          allPosts.map((item) => (
            <div onMouseEnter={() => setPostId(item._id)} key={item._id}>
              <Post
                CommentButton={handleComment}
                postId={item._id}
                userId={item.userId}
                likecount={item.likecount || 0}
                postImage={item.postImage}
                description={item.description}
                commentcount={item.commentcount}
                created={item.createdAt}
              />
            </div>
          ))
        )}

        {loading && hasMore && ( // Show loading spinner if there are more posts to load
          <div className="text-center mt-4">
            <SkeletonCard /> {/* Or you can show a spinner here */}
          </div>
        )}

        {!hasMore && (
          <div className="text-center mt-4">
            <p>No more posts to load</p> {/* Inform the user when there are no more posts */}
          </div>
        )}
      </div>
      </div>
      <div className="mt-8 text-white w-5/12">
        <div className="ml-28 mr-12">
        <div className='flex items-center'>
          <div className='cursor-pointer'>
            <Link to={'/profile'}>
            <AvatarDemo  avatar={user.avatar} />
            </Link>
          </div>
          <div className="flex ml-3 flex-col">
            <Link to={'/profile'}>
          <p className='cursor-pointer text-sm font-semibold -mt-1 font-sans'>{user.username}</p>
            </Link>
          <p className='-mt-1 opacity-50 text-sm'>{user.fullName}</p>
          </div>
          <p className="absolute right-36 font-sans font-semibold text-blue-500 cursor-pointer hover:text-white text-sm">Switch</p>

        </div> 
        <div className="mt-5">
          <div className="flex justify-between">
            <p className="opacity-75">Suggested for you</p>
            {seeAll ? (<p className="text-sm font-sans font-semibold cursor-pointer hover:opacity-35" onClick={()=> setSeeAll(false)}>Show less</p>): (<p className="text-sm font-sans font-semibold cursor-pointer hover:opacity-35" onClick={()=> setSeeAll(true)}>See All</p>)}
          </div >
          <div className="mt-5">
            {!seeAll ? (
              only5user.length === 0 ? (
                <>
                <div className="mb-5">
                <SkeletonDemo/>
                </div>
                <div className="mb-5">
                <SkeletonDemo/>
                </div>
                <div className="mb-5">
                <SkeletonDemo/>
                </div>
                <div className="mb-5">
                <SkeletonDemo/>
                </div>
                <div className="mb-5">
                <SkeletonDemo/>
                </div>
                </>
              ): (
                only5user.map((item)=> (
                          <div>
                            <Usersforfollow avatar={item.avatar} _id={item._id} username={item.username} fullName={item.fullName} />
                          </div>
                        ))
              )
                        // only5user.map((item)=> (
                        //   <div>
                        //     <Usersforfollow avatar={item.avatar} _id={item._id} username={item.username} fullName={item.fullName} />
                        //   </div>
                        // ))
            ): (
              allUser.map((item)=> (
                <div>
                  <Usersforfollow avatar={item.avatar} _id={item._id} username={item.username} fullName={item.fullName} />
                </div>
              ))
            )}
          </div>
          <div className="mt-10">
            <p className="text-sm opacity-40">About
Help
Press
API
Jobs
Privacy
Terms
Locations
Language
Meta Verified</p>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default Home
