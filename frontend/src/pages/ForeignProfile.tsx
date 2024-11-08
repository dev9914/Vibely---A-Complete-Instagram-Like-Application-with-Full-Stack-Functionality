import { Button } from "../components/ui/button"
import { PiSquareHalf } from "react-icons/pi";
import { LiaBookmarkSolid } from "react-icons/lia";
import { MdOutlinePermContactCalendar } from "react-icons/md";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { RxDotsHorizontal } from "react-icons/rx";
import { DataTableDemo } from "../components/ListOfUsers";
import { Link } from "react-router-dom";
import { DropdownMenuDemo } from "../components/dropdownMore";

const ForeignProfile = () => {
    const {userId} = useParams()
    const apiUrl = import.meta.env.VITE_API_URL;
    const [user, setUser] = useState({})
    const [checkfollow, setcheckfollow] = useState(Boolean)
    const [followlist, setFollowlist] = useState(false)
    const [followinglist, setFollowinglist] = useState(false)
    const [list, setList] = useState([])
    const [list2, set2List] = useState([])
    const [allPosts, setAllPosts] = useState([])

    document.body.style.overflowX = 'hidden'

    useEffect(()=>{
        getuser()
    },[checkfollow, userId])

    const [postLength, setPostLength] = useState(Number)

    useEffect(()=>{
      getposts()
    },[userId])
  
    const getposts = async ()=> {
      try {
        const response = await axios.get(`${apiUrl}/post/getuserpostbyId/${userId}`)
  
        console.log(response.data.success)
        if(response.data.data.posts) {
          setPostLength(response.data.data.posts.length)
          setAllPosts(response.data.data.posts)
        }
        return response.data
      } catch (error) {
        setPostLength(0)
        setAllPosts([])
        console.log(error)
      }
    }

    const getuser = async ()=>{
        try {
          const response = await axios.get(`${apiUrl}/users/getuserbyId/${userId}`)
    
    
        // console.log(response.data.data.user)
        setUser(response.data.data.user)
        } catch (error) {
        console.log(error)
        }
      }


    useEffect(()=>{
        checkifFollwed()
    },[checkfollow])

    const addFollow = async ()=> {
        const response = await axios.post(`${apiUrl}/users/follow/${userId}`,{},{headers:{Authorization: localStorage.getItem('token')}})
    
        // console.log(response.data.data.post.likecount)
        checkifFollwed()
        return response.data
      }
    const unFollow = async ()=> {
        const response = await axios.post(`${apiUrl}/users/unfollow/${userId}`,{},{headers:{Authorization: localStorage.getItem('token')}})
    
        // console.log(response.data.data.post.likecount)
        checkifFollwed()
        return response.data
      }

    const checkifFollwed = async () => {
        const response = await axios.get(`${apiUrl}/users/checkifFollwed/${userId}`,{headers:{Authorization: localStorage.getItem('token')}})

        // console.log(response.data.data.followed)
        setcheckfollow(response.data.data.followed)
        return response.data
    }

    const getfollowlist = async () => {
      const response = await axios.post(`${apiUrl}/users/followedlist`,{following: user.followers})
  
      // console.log(response.data.data.users)
      setList(response.data.data.users)
      return response.data
    }
    
    const getfollowinglist = async () => {
      const response = await axios.post(`${apiUrl}/users/followedlist`,{following: user.following})
  
      // console.log(response.data.data.users)
      set2List(response.data.data.users)
      return response.data
    }

  return (
    <div className='text-white flex justify-center'>
      <div className=" w-2/3">
            {followlist && (
            <div onClick={()=> setFollowlist(false)} className="">
            <div style={{
position: 'fixed',
top: '0',
left: '0',
width:'100%',
height: '100%',
backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
zIndex: 1,
}} >
</div>
<div style={{right:'-500px'}} className='fixed w-2/3 z-20'>
<DataTableDemo info={list} />
</div>
</div>
      )}
            {followinglist && (
            <div onClick={()=> setFollowinglist(false)} className="">
            <div style={{
position: 'fixed',
top: '0',
left: '0',
width:'100%',
height: '100%',
backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
zIndex: 1,
}} >
</div>
<div style={{right:'-500px'}} className='fixed w-2/3 z-20'>
<DataTableDemo info={list2} />
</div>
</div>
      )}
        <div className="mt-10">
          <div className="flex space-x-24">
            <img src={user.avatar} className="rounded-full cursor-pointer w-36" alt="" />
            <div className="w-96 space-y-5 flex flex-col">
              <div className="flex items-center space-x-5">
                <p className="text-xl font-sans cursor-pointer ">{user.username}</p>
                {checkfollow == false ? (  <Button size={'sm'} className="cursor-pointer hover:bg-blue-600 bg-blue-500" onClick={()=> addFollow()}>follow</Button>): (  <Button size={'sm'} className="cursor-pointer font-sans font-semibold hover:text-gray-400 opacity-85 text-sm" onClick={()=> unFollow()}>following</Button>)}
                <Link to={`/chat/${userId}`}>
                <Button size={'sm'} style={{background:'#262626'}} className="cursor-pointer">Message</Button>
                </Link>
              
                <DropdownMenuDemo receiverId={userId}/>
              </div>
              <div className="flex space-x-7 font-sans font-normal">
                <p className="">{postLength} posts</p>
                <p onClick={()=>{ setFollowlist(true); getfollowlist()}} className="cursor-pointer">{user.noOfFollower} followers</p>
                <p onClick={()=>{ setFollowinglist(true); getfollowinglist()}} className="cursor-pointer">{user.noOfFollowing} following</p>
              </div>
              <p className="font-sans font-semibold">{user.fullName}</p>
            </div>
          </div>
          <div className="mt-16 border-b border-gray-500 border-opacity-40">
              <div className="w-20 h-20 border cursor-pointer border-white opacity-30 flex justify-center items-center rounded-full bg-gray-700">
              {/* <FaPlus className="" size={50}/> */}
              </div>
              <p className="font-sans font-semibold text-sm ml-2 mt-2 mb-14">Highligths</p>
              </div>
        </div>
        <div>
          <div className="flex justify-center space-x-12 text-xs font-sans mt-3 font-semibold">
            <div className="flex items-center cursor-pointer"><PiSquareHalf size={17} /> <p className="tracking-widest ml-1">POSTS</p></div>
            <div className="flex items-center cursor-pointer"><LiaBookmarkSolid size={17} /><p className="tracking-widest ml-1">SAVED</p></div>
            <div className="flex items-center cursor-pointer"><MdOutlinePermContactCalendar size={17} />
<p className="tracking-widest ml-1">TAGGED</p></div>
          </div>
        </div>
        <div className="text-white">
          <div className="grid grid-cols-3 mt-5">
            {allPosts.map((item)=> (
              <div className="cursor-pointer" key={item._id}>
                <Link to={`/post/${item._id}`}>
                <img src={item.postImage[0]} className="w-72 h-72 object-cover" alt="" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForeignProfile
