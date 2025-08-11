import logo from '/logo.png'

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  return (
    <div className={`h-full ${isCollapsed ? 'w-16' : 'w-80'} bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155] flex flex-col shadow-2xl transition-all duration-300 ease-in-out border-r border-slate-600/30`}>
     

      {/* Content Area - Create Button and Filters */}
      <div className={`flex-1 ${isCollapsed ? 'p-2' : 'p-6'} overflow-y-auto`}>
        {!isCollapsed ? (
          <div className="space-y-6">
            {/* Create Button */}
            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover-lift shadow-lg hover:shadow-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create
            </button>

            {/* Rental Status */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Rental Status</h3>
                <button className="text-slate-400 hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-slate-300 flex-1">Reserved</span>
                  <span className="text-xs font-semibold text-white">16</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-xs text-slate-300 flex-1">Quotation</span>
                  <span className="text-xs font-semibold text-white">1</span>
                </div>
              </div>
            </div>

            {/* Pickup/Return Status */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-600 p-3 rounded-lg text-center text-white">
                  <div className="text-lg font-bold">4</div>
                  <div className="text-xs opacity-90">Picked Up</div>
                </div>
                <div className="bg-blue-600 p-3 rounded-lg text-center text-white">
                  <div className="text-lg font-bold">1</div>
                  <div className="text-xs opacity-90">Returned</div>
                </div>
              </div>
            </div>

            {/* Invoice Status */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Invoice Status</h3>
                <button className="text-slate-400 hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-blue-500 p-2 rounded-lg text-center text-white">
                  <div className="text-sm font-bold">16</div>
                  <div className="text-xs opacity-90">Fully</div>
                  <div className="text-xs opacity-90">Invoice</div>
                </div>
                <div className="bg-purple-500 p-2 rounded-lg text-center text-white">
                  <div className="text-sm font-bold">3</div>
                  <div className="text-xs opacity-90">Partly</div>
                  <div className="text-xs opacity-90">to Issue</div>
                </div>
                <div className="bg-gray-500 p-2 rounded-lg text-center text-white">
                  <div className="text-sm font-bold">8</div>
                  <div className="text-xs opacity-90">To</div>
                  <div className="text-xs opacity-90">Invoice</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-slate-300">Active</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-slate-300">Maintenance</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 space-y-4">
            {/* Collapsed Create Button */}
            <button 
              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl flex items-center justify-center transition-all duration-300 hover-lift shadow-lg hover:shadow-xl group relative"
              title="Create"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                Create
              </div>
            </button>
            
            {/* Collapsed indicators */}
            <div className="w-8 h-8 bg-gradient-to-br from-green-500/30 to-orange-500/30 rounded-xl flex items-center justify-center">
              <span className="text-xs">📊</span>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/30 to-green-500/30 rounded-xl flex items-center justify-center">
              <span className="text-xs">📦</span>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-xl flex items-center justify-center">
              <span className="text-xs">📄</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-6 border-t border-slate-600/50 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-2">
              Clean slate, ready for your features
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">Status: Ready</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar