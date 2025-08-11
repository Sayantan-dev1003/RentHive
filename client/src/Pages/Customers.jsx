import { useState } from 'react'

const Customers = () => {
  const [customers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+91 98765 43210',
      totalRentals: 15,
      totalSpent: '₹25,000',
      lastRental: '2024-01-15',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+91 98765 43211',
      totalRentals: 8,
      totalSpent: '₹12,500',
      lastRental: '2024-01-16',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      phone: '+91 98765 43212',
      totalRentals: 22,
      totalSpent: '₹38,000',
      lastRental: '2024-01-17',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      phone: '+91 98765 43213',
      totalRentals: 3,
      totalSpent: '₹4,500',
      lastRental: '2024-01-10',
      status: 'Inactive'
    }
  ])

  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="w-full space-y-6">
      
      {/* Page Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Customer Management</h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600">Manage customer information and rental history</p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 w-full">
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-[#2542ff] to-[#1e3a8a] text-white px-4 lg:px-6 py-3 rounded-xl hover:from-[#1e3a8a] hover:to-[#1e40af] transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>➕</span>
              <span>Add Customer</span>
            </span>
          </button>
          <button className="w-full sm:w-auto bg-white text-gray-700 px-4 lg:px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg border border-gray-200">
            <span className="flex items-center justify-center space-x-2">
              <span>📊</span>
              <span>Export CSV</span>
            </span>
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2542ff] focus:border-transparent transition-all duration-200"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <button className="w-full sm:w-auto p-3 bg-white rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg border border-gray-200">
            <span>⚙️</span>
          </button>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 w-full">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 lg:p-6">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 bg-blue-100 rounded-xl">
              <span className="text-xl lg:text-2xl">👥</span>
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 lg:p-6">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 bg-green-100 rounded-xl">
              <span className="text-xl lg:text-2xl">✅</span>
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm font-medium text-gray-600">Active</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">142</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 lg:p-6">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 bg-yellow-100 rounded-xl">
              <span className="text-xl lg:text-2xl">🆕</span>
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">23</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 lg:p-6">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 bg-purple-100 rounded-xl">
              <span className="text-xl lg:text-2xl">💰</span>
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm font-medium text-gray-600">Avg. Revenue</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">₹18,500</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 lg:p-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 w-full">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200 bg-white">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
            <select className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200 bg-white">
              <option>Name</option>
              <option>Total Rentals</option>
              <option>Total Spent</option>
              <option>Last Rental</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rental Count</label>
            <select className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200 bg-white">
              <option>All</option>
              <option>0-5</option>
              <option>6-15</option>
              <option>16+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Actions</label>
            <button className="w-full bg-gray-100 text-gray-700 px-3 lg:px-4 py-2 lg:py-3 rounded-xl hover:bg-gray-200 transition-all duration-200">
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden w-full">
        <div className="px-4 lg:px-8 py-4 lg:py-6 border-b border-gray-100">
          <h2 className="text-lg lg:text-2xl font-bold text-gray-900">Customer List</h2>
          <p className="text-sm lg:text-base text-gray-600">Manage and view all customer information</p>
        </div>
        
        {/* Mobile Cards View */}
        <div className="lg:hidden p-4 lg:p-6 space-y-4 w-full">
          {customers.map((customer) => (
            <div key={customer.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#2542ff] to-[#1e3a8a] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{customer.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base">{customer.name}</h3>
                    <p className="text-xs text-gray-500">ID: {customer.id}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {customer.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-900">{customer.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phone:</span>
                  <span className="text-gray-900">{customer.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Rentals:</span>
                  <span className="text-gray-900">{customer.totalRentals}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Spent:</span>
                  <span className="text-gray-900 font-medium">{customer.totalSpent}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Rental:</span>
                  <span className="text-gray-500">{customer.lastRental}</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-[#2542ff] text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#1e3a8a] transition-colors">
                  View
                </button>
                <button className="flex-1 bg-white text-[#2542ff] px-3 py-2 rounded-lg text-xs font-medium border border-[#2542ff] hover:bg-[#2542ff] hover:text-white transition-colors">
                  Edit
                </button>
                <button className="flex-1 bg-white text-gray-600 px-3 py-2 rounded-lg text-xs font-medium border border-gray-300 hover:bg-gray-50 transition-colors">
                  History
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Rentals</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Rental</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#2542ff] to-[#1e3a8a] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{customer.name.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">ID: {customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.totalRentals}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.totalSpent}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.lastRental}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-[#2542ff] hover:text-[#1e3a8a] transition-colors">View</button>
                      <button className="text-green-600 hover:text-green-800 transition-colors">History</button>
                      <button className="text-gray-600 hover:text-gray-800 transition-colors">Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 lg:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Add New Customer</h2>
            <form className="space-y-4 lg:space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 lg:pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#2542ff] to-[#1e3a8a] text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold hover:from-[#1e3a8a] hover:to-[#1e40af] transition-all duration-200 shadow-lg"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers 