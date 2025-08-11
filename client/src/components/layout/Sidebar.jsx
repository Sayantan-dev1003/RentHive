import logo from '/logo.png'

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  return (
    <div className={`h-full ${isCollapsed ? 'w-16' : 'w-80'} bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155] flex flex-col shadow-2xl transition-all duration-300 ease-in-out`}>
      {/* Header */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center p-4' : 'justify-between p-6'} border-b border-slate-600/50`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} animate-fadeIn`}>
          <div className="w-10 h-10 bg-gradient-to-br from-[#2542ff] via-[#3b82f6] to-[#1e40af] rounded-xl flex items-center justify-center shadow-lg hover-glow animate-float">
            <img src={logo} alt="RentHive Logo" className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">RENTHIVE</span>
              <div className="text-sm text-slate-400 font-medium">Additional Features</div>
            </div>
          )}
        </div>
      </div>

      {/* Content Area - Create Button and Features */}
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
            
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                <span className="text-4xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Ready for Features</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                This sidebar is clean and ready for any additional features you want to add later.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 space-y-4">
            {/* Collapsed Create Button */}
            <button 
              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl flex items-center justify-center transition-all duration-300 hover-lift shadow-lg hover:shadow-xl group"
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
            
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center animate-pulse">
              <span className="text-lg">✨</span>
            </div>
            <div className="w-6 h-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
              <span className="text-sm">🚀</span>
            </div>
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
              <span className="text-sm">⚡</span>
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