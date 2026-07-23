import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Toaster } from 'sonner'

// Pages
import Home from '@/pages/Home'
import Profile from '@/pages/Profile'
import SignUp from '@/pages/SignUp'
import SignIn from '@/pages/SignIn'
import ForeignProfile from '@/pages/ForeignProfile'
import Explore from '@/pages/Explore'
import UserPost from '@/pages/UserPost'
import Chat from '@/pages/Chat'
import Messages from '@/pages/Messages'

// Components
import { AppLayout } from '@/components/layout'
import ProtectedRoutes from '@/components/ProtectedRoutes'

// Services & Store
import { useGetCurrentUserQuery } from '@/services/userApi'
import { useNotifications } from '@/hooks/useNotifications'
import { selectIsAuthenticated, setUser, setInitialized } from '@/store/authSlice'
import MessageHome from './components/messages/MessageHome'
import MessagesLayout from './components/layout/MessagesLayout'

function App() {
  const dispatch = useDispatch()
  
  // Use Redux state for auth
  const isAuthenticated = useSelector(selectIsAuthenticated)
  
  // Get current user with RTK Query
  const { data: userData, isSuccess } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated
  })

  console.log({
  isAuthenticated,
  isSuccess,
  userData,
});
  
  const user = userData?.user || userData || {}

  // Set dark mode on html element
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  // Update Redux state when user data is fetched
  useEffect(() => {
if (isSuccess && userData) {
    dispatch(setUser(userData))
}
    dispatch(setInitialized(true))
  }, [isSuccess, userData, dispatch])

  // Initialize notifications
  const {
    permission,
    isSupported,
    requestPermission,
    registerToken,
  } = useNotifications()

  // Auto-request notification permission when user logs in
  useEffect(() => {
    if (isAuthenticated && isSupported && permission === 'default') {
      const shouldAsk = localStorage.getItem('notification-prompt-dismissed')
      if (!shouldAsk) {
        setTimeout(() => {
          if (window.confirm('Enable push notifications to stay updated with likes, comments, and follows?')) {
            requestPermission().then((perm) => {
              if (perm === 'granted') {
                registerToken()
              }
            })
          } else {
            localStorage.setItem('notification-prompt-dismissed', 'true')
          }
        }, 2000)
      }
    }
  }, [isAuthenticated, isSupported, permission, requestPermission, registerToken])

  return (
    <>
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        closeButton
        theme="dark"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          },
          className: 'font-sans',
        }}
      />

      {/* App Layout with Sidebar */}
      <AppLayout user={user}>
        <Routes>
          {/* Protected Routes */}
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
          <Route path='/user/:userId' element={
            <ProtectedRoutes>
              <ForeignProfile/>
            </ProtectedRoutes>
          } />
          <Route path='/explore' element={
            <ProtectedRoutes>
              <Explore/>
            </ProtectedRoutes>
          } />
          <Route path='/post/:postId' element={
            <ProtectedRoutes>
              <UserPost/>
            </ProtectedRoutes>
          } />
<Route
    element={
        <ProtectedRoutes>
            <MessagesLayout user={user} />
        </ProtectedRoutes>
    }
>
    <Route
        path="/messages"
        element={<MessageHome />}
    />

    <Route
        path="/chat/:receiverId"
        element={
            <Chat
                username={user.username}
                userAvatar={user.avatar}
                userId={user._id}
            />
        }
    />
</Route>

          {/* Guest-only routes */}
          <Route path='/signup' element={
            <ProtectedRoutes requireAuth={false}>
              <SignUp/>
            </ProtectedRoutes>
          } />
          <Route path='/signin' element={
            <ProtectedRoutes requireAuth={false}>
              <SignIn/>
            </ProtectedRoutes>
          } />
        </Routes>
      </AppLayout>
    </>
  )
}

export default App
