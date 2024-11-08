import { useEffect, useState } from 'react'
import { AvatarDemo } from './ui/AvatarImage'
import axios from 'axios'
import { Link } from 'react-router-dom'

interface UsersforfollowProps {
    avatar: string,
    _id: string,
    fullName: string,
    username: string
}

const Usersforfollow = ({avatar, _id, fullName, username, }: UsersforfollowProps) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [idforFollow, setIdforFollow] = useState('')
    const [checkfollow, setcheckfollow] = useState(Boolean)

    useEffect(()=>{
        checkifFollwed()
    },[checkfollow])

    const addFollow = async ()=> {
        const response = await axios.post(`${apiUrl}/users/follow/${idforFollow}`,{},{headers:{Authorization: localStorage.getItem('token')}})
    
        // console.log(response.data.data.post.likecount)
        checkifFollwed()
        return response.data
      }
    const unFollow = async ()=> {
        const response = await axios.post(`${apiUrl}/users/unfollow/${idforFollow}`,{},{headers:{Authorization: localStorage.getItem('token')}})
    
        // console.log(response.data.data.post.likecount)
        checkifFollwed()
        return response.data
      }

    const checkifFollwed = async () => {
        const response = await axios.get(`${apiUrl}/users/checkifFollwed/${_id}`,{headers:{Authorization: localStorage.getItem('token')}})

        // console.log(response.data.data.followed)
        setcheckfollow(response.data.data.followed)
        return response.data
    }
  return (
    <div onMouseEnter={()=> setIdforFollow(_id)} key={_id} className='flex mb-4 items-center'>
    <div className='cursor-pointer'>
      <Link to={`/user/${_id}`}>
      <AvatarDemo  avatar={avatar} />
      </Link>
    </div>
    <div className="flex ml-3 flex-col">
    <Link to={`/user/${_id}`}>
    <p className='cursor-pointer text-sm font-semibold -mt-1 font-sans'>{username}</p>
    </Link>
    <p className='-mt-1 opacity-50 text-sm'>{fullName}</p>
    </div>
    {checkfollow == false ? (
        <p onClick={()=> addFollow()} className="absolute right-36 font-sans font-semibold cursor-pointer hover:text-white text-blue-500 text-sm">follow</p>
    ): (
        <p onClick={()=> unFollow()} className="absolute right-32 font-sans font-semibold cursor-pointer hover:text-gray-400 opacity-85 text-sm">following</p>
    )}

  </div> 
  )
}

export default Usersforfollow
