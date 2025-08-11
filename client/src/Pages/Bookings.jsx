import { useState, useEffect } from 'react'
import apiService from '../services/api'

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  // Fetch bookings (orders) data
  const fetchBookingsData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [ordersResponse, productsResponse] = await Promise.all([
        apiService.getOrders(),
        apiService.getProducts()
      ])

      if (ordersResponse.success) {
        const ordersList = ordersResponse.data.orders || []
        
        // Transform orders to bookings format
        const transformedBookings = ordersList.map(order => {
          const orderProducts = order.items?.map(item => {
            const product = productsResponse.data.products?.find(p => p._id === item.productId)
            return product ? product.name : 'Unknown Product'
          }) || []

          const startDate = order.items?.[0]?.rentalDuration?.startDate 
            ? new Date(order.items[0].rentalDuration.startDate).toLocaleDateString()
            : new Date(order.createdAt).toLocaleDateString()
          
          const endDate = order.items?.[0]?.rentalDuration?.endDate
            ? new Date(order.items[0].rentalDuration.endDate).toLocaleDateString()
            : ''

          const start = new Date(order.items?.[0]?.rentalDuration?.startDate || order.createdAt)
          const end = new Date(order.items?.[0]?.rentalDuration?.endDate || start)
          const diffTime = Math.abs(end - start)
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          return {
            id: order._id,
            customer: 'Customer', // We'll show customer ID for now
            product: orderProducts.join(', ') || 'Multiple Items',
            startDate,
            endDate,
            duration: `${diffDays} day${diffDays !== 1 ? 's' : ''}`,
            totalAmount: `₹${order.totalAmount || 0}`,
            status: order.status === 'reserved' ? 'Confirmed' : 
                   order.status === 'quotation' ? 'Pending' : 
                   order.status.charAt(0).toUpperCase() + order.status.slice(1),
            pickupDate: startDate,
            returnDate: endDate,
            originalData: order
          }
        })
        
        setBookings(transformedBookings)
      }

      if (productsResponse.success) {
        setProducts(productsResponse.data.products || [])
      }

    } catch (err) {
      setError('Failed to fetch bookings data: ' + err.message)
      console.error('Bookings data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle view booking
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking)
    setShowViewModal(true)
  }

  // Handle edit booking
  const handleEditBooking = (booking) => {
    setSelectedBooking(booking)
    setShowEditModal(true)
  }

  useEffect(() => {
    fetchBookingsData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
          <button 
            onClick={fetchBookingsData}
            className="ml-4 text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      )}

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

      {/* Main Content: Calendar and Bookings Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
        {/* Calendar Section */}
        <div className="bg-white rounded-lg shadow flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Calendar View</h2>
              <div className="flex items-center space-x-4">
                <button className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-900 min-w-[120px] text-center">January 2025</span>
                <button className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6 flex-1 overflow-auto">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {/* Days of week header */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-700 bg-gray-50 rounded">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 6 + 1; // Adjust for January 2025 starting on Wednesday
                const isCurrentMonth = day > 0 && day <= 31;
                const hasBooking = [15, 16, 20, 25].includes(day); // Sample booking days
                const isToday = day === new Date().getDate(); // Highlight today
                const bookingCount = hasBooking ? Math.floor(Math.random() * 3) + 1 : 0; // Random booking count for demo
                
                return (
                  <div
                    key={i}
                    className={`
                      relative h-12 p-1 text-center cursor-pointer rounded transition-all duration-200
                      ${isCurrentMonth 
                        ? 'text-gray-900 hover:bg-blue-50 hover:scale-105' 
                        : 'text-gray-300'
                      }
                      ${hasBooking ? 'bg-blue-100 ring-1 ring-blue-300' : ''}
                      ${isToday ? 'bg-blue-600 text-white font-bold shadow-lg' : ''}
                    `}
                    title={hasBooking ? `${bookingCount} booking${bookingCount > 1 ? 's' : ''}` : ''}
                  >
                    {isCurrentMonth && (
                      <>
                        <span className="text-sm">{day}</span>
                        {hasBooking && bookingCount > 0 && (
                          <div className={`absolute top-1 right-1 w-4 h-4 text-xs flex items-center justify-center rounded-full font-bold ${
                            isToday ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                          }`}>
                            {bookingCount}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Has Bookings</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                <span>Available</span>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
                  <div className="text-sm text-blue-700">Total Bookings</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {bookings.filter(b => b.status === 'Confirmed').length}
                  </div>
                  <div className="text-sm text-green-700">Confirmed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings Section */}
        <div className="bg-white rounded-lg shadow flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
              <div className="text-sm text-gray-500">
                {loading ? 'Loading...' : `${bookings.length} total`}
              </div>
            </div>
            
            {/* Quick Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search bookings..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <span className="mt-2 text-gray-600 text-sm">Loading bookings...</span>
                </div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
                  <p className="text-gray-600">Bookings will appear here once customers make reservations</p>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto">
                <div className="p-4 space-y-3">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">{booking.customer}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            <div className="font-medium">{booking.product}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {booking.pickupDate} → {booking.returnDate}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="text-gray-500">Duration: </span>
                              <span className="font-medium text-gray-900">{booking.duration}</span>
                            </div>
                            <div className="text-sm font-bold text-gray-900">{booking.totalAmount}</div>
                          </div>
                          
                          <div className="flex space-x-2 mt-3">
                            <button 
                              onClick={() => handleViewBooking(booking)}
                              className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                            >
                              View Details
                            </button>
                            <button 
                              onClick={() => handleEditBooking(booking)}
                              className="text-xs text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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

      {/* View Booking Modal */}
      {showViewModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
              <button
                onClick={() => {setShowViewModal(false); setSelectedBooking(null)}}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.customer}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                    selectedBooking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                    selectedBooking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedBooking.status}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Product</label>
                <p className="mt-1 text-sm text-gray-900">{selectedBooking.product}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pickup Date</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.pickupDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Return Date</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.returnDate}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.duration}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                  <p className="mt-1 text-sm font-bold text-gray-900">{selectedBooking.totalAmount}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {setShowViewModal(false); setSelectedBooking(null)}}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Edit Booking</h2>
              <button
                onClick={() => {setShowEditModal(false); setSelectedBooking(null)}}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                  defaultValue={selectedBooking.status}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date</label>
                  <input
                    type="date"
                    defaultValue={new Date(selectedBooking.pickupDate).toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Return Date</label>
                  <input
                    type="date"
                    defaultValue={new Date(selectedBooking.returnDate).toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {setShowEditModal(false); setSelectedBooking(null)}}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
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