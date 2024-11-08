import './App.css'
import Sidebar from './components/Sidebar'
import { Routes,Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import CreatePost from './pages/CreatePost'
import Profile from './pages/Profile'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import { useEffect, useState } from 'react'
import ForeignProfile from './pages/ForeignProfile'
import axios from 'axios'
import Explore from './pages/Explore'
import UserPost from './pages/UserPost'
import Chat from './pages/Chat'
import Messages from './pages/Messages'
import ProtectedRoutes from './components/ProtectedRoutes'

function App() {
  const location = useLocation();
  const hideSidebar = location.pathname === '/signup' || location.pathname === '/signin';
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    return !!token; // Returns true if token exists, otherwise false
  };


  const loggedIn = isAuthenticated()

  const apiUrl = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState({})

  const getuser = async ()=>{
    try {
      const response = await axios.get(`${apiUrl}/users/getuserdetails`,{headers:{Authorization: localStorage.getItem('token')}})


      console.log(response.data.data)
      setUser(response.data.data)
      return response.data
    } catch (error) {
    console.log(error)
    }
  }

  useEffect(()=>{
    if(loggedIn == true) {
      getuser()
    }
  },[loggedIn])

  return (
    <>
    <div className='flex bg-black'>
    {!hideSidebar && <Sidebar user={user} />}
    <div style={{width:'85vw',marginLeft:'15vw'}} className='bg-black'>
      <Routes>
        <Route path='/' element={
        <ProtectedRoutes>
          <Home user={user}/>
        </ProtectedRoutes>
        } />
        <Route path='/profile' element={
           <ProtectedRoutes>
             <Profile user={user}/>
           </ProtectedRoutes>
        } />
        <Route path='/signup' element={
          <SignUp/>
        } />
        <Route path='/signin' element={
          <SignIn/>} />
        <Route path='/uploadpost' element={
           <ProtectedRoutes>
             <CreatePost/>
           </ProtectedRoutes>
        } />
        <Route path='/user/:userId' element={
          <ProtectedRoutes>
          <ForeignProfile/>
        </ProtectedRoutes>} />
        <Route path='/Explore' element={
           <ProtectedRoutes>
             <Explore/>
           </ProtectedRoutes>
        } />
        <Route path='/post/:postId' element={
          <ProtectedRoutes>
          <UserPost/>
        </ProtectedRoutes>
        } />
        <Route path='/chat/:receiverId' element={
          <ProtectedRoutes>
          <Chat username={user.username} userAvatar={user.avatar} userId={user._id}/>
        </ProtectedRoutes>
        } />
        <Route path='/messages' element={
           <ProtectedRoutes>
             <Messages user={user}/>
           </ProtectedRoutes>
        } />

      </Routes>
    </div>
    </div>
    </>
  )
}

export default App
