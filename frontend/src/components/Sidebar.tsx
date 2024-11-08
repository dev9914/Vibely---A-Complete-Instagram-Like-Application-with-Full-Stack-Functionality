import { Link } from "react-router-dom"
import { GoHomeFill } from "react-icons/go";
import { IoSearch } from "react-icons/io5";
import { FaCompass } from "react-icons/fa";
import { BiMoviePlay } from "react-icons/bi";
import { RiMessengerLine } from "react-icons/ri";
import { FaRegHeart } from "react-icons/fa";
import { FiPlusSquare } from "react-icons/fi";
import { AvatarDemo } from "./ui/AvatarImage";
import { useDispatch } from "react-redux";
import { opened , closed } from "../store/uploadpicSlice";
import { GiHamburgerMenu } from "react-icons/gi";
import { LucideMenu } from "lucide-react";
import { DropdownMenuDemo } from "./MoreMenu";


const Navbar = ({user}) => {

  const dispatch = useDispatch()

  return (
    <div className="">
      <nav className="bg-black w-60 border-r border-gray-500 border-opacity-40 h-screen fixed">
  <div className="sm:px-6 lg:px-8">
    <div className="flex flex-col">
      <div className=" mt-8">
        <p className="text-white cursor-pointer text-2xl font-sans font-bold">Vibely</p>
      </div>
      <div className="sm:block">
        <div className="flex my-6 flex-col justify-end">
          <Link to="/" className="text-white textSize  margin2 my-2 flex items-center gap-x-3 py-2 rounded-md font-medium"><GoHomeFill size={27} />
<span>Home</span></Link>
          <Link to="/" className="text-white textSize margin2 my-2 py-2 rounded-md font-medium flex items-center gap-x-3"><IoSearch size={27} /><span>Search</span></Link>
          <Link to="/Explore" className="text-white textSize margin2 my-2 py-2 rounded-md font-medium flex items-center gap-x-3"><FaCompass size={27} /><span>Explore</span></Link>
          <Link to="/" className="text-white textSize margin2 my-2 py-2 rounded-md font-medium flex items-center gap-x-3"><BiMoviePlay size={27} /><span>Reels</span></Link>
          <Link to="/messages" className="text-white textSize margin2 my-2 py-2 rounded-md font-medium flex items-center gap-x-3"><RiMessengerLine size={27} /><span>Messages</span></Link>
          <Link to="/" className="text-white textSize margin2 my-2 py-2 rounded-md font-medium flex items-center gap-x-3"><FaRegHeart size={23}/><span>Notifications</span></Link>
          <div onClick={()=> dispatch(opened())} className="text-white cursor-pointer textSize margin2 my-2 py-2 rounded-md font-medium flex items-center gap-x-3"><FiPlusSquare size={25}/>
<span>Create</span></div>
          <Link to="/profile" className="text-white onHover margin2 textSize my-2 py-2 rounded-md font-medium flex items-center gap-x-3"><AvatarDemo size="7" avatar={user.avatar}/><span>Profile</span></Link>
          <div className="text-white cursor-pointer -ml-3 mt-20 textSize margin2 my-2 py-2 rounded-md font-medium flex items-center gap-x-3">
            {/* <LucideMenu size={27} /> */}
            <DropdownMenuDemo/>
            </div>
        </div>
      </div>
    </div>
  </div>
  <div className=''>
    logout 
  </div>
</nav>

    </div>
  )
}

export default Navbar