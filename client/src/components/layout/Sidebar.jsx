import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../Context/AuthContext";

const Sidebar = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div
      className={`h-full ${
        sidebarCollapsed ? "w-16" : "w-80"
      } bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155] flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ease-in-out border-r border-slate-600/30`}
    >
      {/* Content Area - Create Button and Filters */}
      <div className={`flex-1 ${sidebarCollapsed ? "p-2" : "p-6"} overflow-y-auto`}>
        {!sidebarCollapsed ? (
          <div className="space-y-6">
            {/* Toggle Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-2.5 bg-blue-500 rounded-xl text-white transition-all duration-300 hover-lift"
                title="Collapse sidebar"
              >
                <IoIosArrowBack />
              </button>
            </div>

            {/* Rental Status */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">
                  Rental Status
                </h3>
                <button className="text-slate-400 hover:text-white">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-slate-300 flex-1">
                    Reserved
                  </span>
                  <span className="text-xs font-semibold text-white">16</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-xs text-slate-300 flex-1">
                    Quotation
                  </span>
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
                <h3 className="text-sm font-semibold text-white">
                  Invoice Status
                </h3>
                <button className="text-slate-400 hover:text-white">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
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
            {/* Collapsed indicators */}
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-2.5 rounded-xl bg-blue-500 text-white transition-all duration-300 hover-lift cursor-pointer"
              title="Expand sidebar"
            >
              <IoIosArrowForward />
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500/30 to-orange-500/30 rounded-xl flex items-center justify-center cursor-pointer">
              {!sidebarCollapsed && (
                <span className="text-xs text-white">📊</span>
              )}
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/30 to-green-500/30 rounded-xl flex items-center justify-center cursor-pointer">
              <span className="text-xs">📦</span>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-xl flex items-center justify-center cursor-pointer">
              <span className="text-xs">📄</span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center my-3"
      >
        {sidebarCollapsed ? (
          <FiLogOut />
        ) : (
          <>
            <FiLogOut />
            <span className="flex items-center justify-center px-6 py-2 mx-6 mb-5 cursor-pointer text-white rounded-xl bg-red-700 transition-all duration-300">
              Logout
            </span>
          </>
        )}
      </button>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="py-2 border-t border-slate-600/50 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-2">
              Clean slate, ready for your features
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">
                Status: Ready
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
