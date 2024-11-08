import { Button } from "../components/ui/button"
import { IoMdSettings } from "react-icons/io";
import { PiSquareHalf } from "react-icons/pi";
import { LiaBookmarkSolid } from "react-icons/lia";
import { MdOutlinePermContactCalendar } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import axios from "axios";
import { useEffect, useState } from "react";
import { CardWithForm } from "../components/Card";
import { useDispatch, useSelector } from "react-redux";
import { closed } from "../store/uploadpicSlice";
import { RootState } from "../store/store";
import { DataTableDemo } from "../components/ListOfUsers";
import { Link } from "react-router-dom";

interface ProfileProps {
  user: {
    _id: string;
    username: string;
    avatar: string;
    noOfFollower: number;
    noOfFollowing: number;
    fullName: string;
    followers: any[]; // Adjust this according to your data structure
    following: any[];  // Adjust this according to your data structure
  };
}

const Profile = ({user}:ProfileProps) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [postLength, setPostLength] = useState(Number)
  document.body.style.overflowX = 'hidden'

  const dispatch = useDispatch()
  const createpost = useSelector((state: RootState)=> state.upload.status)

  const [followlist, setFollowlist] = useState(false)
  const [followinglist, setFollowinglist] = useState(false)
  const [list, setList] = useState([])
  const [list2, set2List] = useState([])
  const [allPosts, setAllPosts] = useState([])
  const [userInfo, setUserInfo] = useState({})

  useEffect(()=>{
    getposts()
    getuser()
  },[])

  const Id = user._id

  const getuser = async ()=>{
    try {
      const response = await axios.get(`${apiUrl}/users/getuserbyId/${Id}`)


    // console.log(response.data.data.user)
    setUserInfo(response.data.data.user)
    } catch (error) {
    console.log(error)
    }
  }

  const getposts = async ()=> {
    try {
      const response = await axios.get(`${apiUrl}/post/getuserpostbyId/${user._id}`)

      // console.log(response.data.data.posts)
      setPostLength(response.data.data.posts.length)
      setAllPosts(response.data.data.posts)
      return response.data
    } catch (error) {
      console.log(error)
    }
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
            <div className="space-y-5 flex flex-col">
              <div className="flex items-center space-x-5">
                <p className="text-xl font-sans cursor-pointer ">{user.username}</p>
                <Button size={'sm'} style={{background:'#262626'}} className="cursor-pointer">Edit profile</Button>
                <Button size={'sm'} style={{background:'#262626'}} className="cursor-pointer">View archive</Button>
                <IoMdSettings size={27}/>
              </div>
              <div className="flex space-x-7 font-sans font-normal">
                <p className="">{postLength} posts</p>
                <p onClick={()=>{ setFollowlist(true); getfollowlist()}} className="cursor-pointer">{userInfo.noOfFollower || 0} followers</p>
                <p onClick={()=>{ setFollowinglist(true); getfollowinglist()}}  className="cursor-pointer">{userInfo.noOfFollowing || 0} follwing</p>
              </div>
              <p className="font-sans font-semibold">{user.fullName}</p>
            </div>
          </div>
          <div className="mt-16 border-b border-gray-500 border-opacity-40">
              <div className="w-20 h-20 border cursor-pointer border-white opacity-30 flex justify-center items-center rounded-full bg-gray-700">
              <FaPlus className="" size={50}/>
              </div>
              <p className="font-sans font-semibold text-sm ml-7 mt-2 mb-14">New</p>
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

export default Profile
