import { ReactNode, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { cn } from '@/lib/utils'
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { CardWithForm } from "@/components/Card";

interface AppLayoutProps {
  children: ReactNode
  user: {
    _id?: string
    username?: string
    avatar?: string
    fullName?: string
  }
}

/**
 * AppLayout Component
 * 
 * Main layout wrapper for the application providing:
 * - Collapsible sidebar navigation (hidden on auth pages)
 * - Main content area with proper spacing
 * - Responsive design with sidebar state persistence
 */
const AppLayout = ({ children, user }: AppLayoutProps) => {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const isCreatePostModalOpen = useSelector(
  (state: RootState) => state.ui.isCreatePostModalOpen
);
  
  // Load sidebar preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved))
    }
  }, [])

  // Save sidebar preference to localStorage
  const handleCollapsedChange = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed)
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed))
  }
  
  // Pages where sidebar should be hidden
  const hideSidebar = ['/signin', '/signup'].includes(location.pathname)
  const isMessagingRoute =
    location.pathname === '/messages' ||
    location.pathname.startsWith('/chat/')

  if (hideSidebar) {
    return <>{children}</>
  }

return (
  <div
    className={cn(
      "bg-background",
      isMessagingRoute ? "h-screen overflow-hidden" : "min-h-screen"
    )}
  >
    <Sidebar
      user={user}
      collapsed={sidebarCollapsed}
      onCollapsedChange={handleCollapsedChange}
    />

    <main
      className={cn(
        "transition-all duration-300",
        isMessagingRoute ? "h-screen overflow-hidden" : "min-h-screen",
        sidebarCollapsed ? "ml-[72px]" : "ml-[220px]"
      )}
    >
      <div
        className={cn(
          "w-full",
          isMessagingRoute ? "h-full overflow-hidden" : "min-h-screen"
        )}
      >
        {children}
      </div>

      {isCreatePostModalOpen && <CardWithForm />}
    </main>
  </div>
)
}

export default AppLayout
