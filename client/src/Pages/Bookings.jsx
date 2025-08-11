import { useState } from 'react'

const Bookings = () => {
  const [bookings] = useState([
    {
      id: 1,
      customer: 'John Doe',
      product: 'Drill Machine',
      startDate: '2024-01-20',
      endDate: '2024-01-25',
      duration: '5 days',
      totalAmount: '₹1,000',
      status: 'Confirmed',
      pickupDate: '2024-01-20',
      returnDate: '2024-01-25'
    },
    {
      id: 2,
      customer: 'Jane Smith',
      product: 'Ladder',
      startDate: '2024-01-22',
      endDate: '2024-01-24',
      duration: '2 days',
      totalAmount: '₹300',
      status: 'Pending',
      pickupDate: '2024-01-22',
      returnDate: '2024-01-24'
    },
    {
      id: 3,
      customer: 'Mike Johnson',
      product: 'Generator',
      startDate: '2024-01-25',
      endDate: '2024-02-01',
      duration: '7 days',
      totalAmount: '₹3,500',
      status: 'Confirmed',
      pickupDate: '2024-01-25',
      returnDate: '2024-02-01'
    }
  ])

  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage rental reservations and scheduling</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Booking
        </button>
      </div>

      {/* Calendar View Toggle */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium">
            Calendar View
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200">
            List View
          </button>
        </div>
      </div>

      {/* Calendar Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View</h3>
          <p className="text-gray-500">Calendar component will be integrated here for booking management</p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.customer}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.product}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.pickupDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.returnDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.totalAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">Edit</button>
                      <button className="text-gray-600 hover:text-gray-900">View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Booking</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Select customer</option>
                  <option>John Doe</option>
                  <option>Jane Smith</option>
                  <option>Mike Johnson</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Select product</option>
                  <option>Drill Machine</option>
                  <option>Ladder</option>
                  <option>Generator</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bookings 