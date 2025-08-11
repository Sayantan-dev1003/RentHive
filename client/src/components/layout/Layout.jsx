import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="flex flex-col h-full w-full">
        {/* Header - Full width */}
        <Header 
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
        
        {/* Content Area with Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Page Sidebar - Below header, collapsible horizontally */}
          <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} flex-shrink-0 transition-all duration-300 ease-in-out`}>
            <Sidebar 
              isCollapsed={sidebarCollapsed}
              setIsCollapsed={setSidebarCollapsed}
            />
          </div>
          
          {/* Main content */}
          <div className="flex-1 overflow-auto">
            <main className="p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout