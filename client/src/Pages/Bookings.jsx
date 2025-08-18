import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import apiService from "../services/api";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Form state for new booking
  const [newBooking, setNewBooking] = useState({
    customer: "",
    product: "",
    startDate: "",
    endDate: "",
  });

  // Calendar state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState("month");
  const [pickupSlotsCache, setPickupSlotsCache] = useState({});

  // Calendar helper functions
  const getBookingsForDate = (date) => {
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.pickupDate);
      return bookingDate.toDateString() === date.toDateString();
    });
  };

  const hasBookingsOnDate = (date) => {
    return getBookingsForDate(date).length > 0;
  };

  const getBookingCountForDate = (date) => {
    return getBookingsForDate(date).length;
  };

  // Enhanced calendar functions for pickup slots
  const getPickupSlotsForDate = async (date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // Check cache first
      if (pickupSlotsCache[dateStr]) {
        return pickupSlotsCache[dateStr];
      }
      
      const response = await apiService.getPickupSlotsByDate(dateStr);
      const slots = response.success ? response.data.slots : [];
      
      // Cache the result
      setPickupSlotsCache(prev => ({
        ...prev,
        [dateStr]: slots
      }));
      
      return slots;
    } catch (error) {
      console.error('Error fetching pickup slots for date:', error);
      return [];
    }
  };

  const hasPickupSlotsOnDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const slots = pickupSlotsCache[dateStr] || [];
    return slots.length > 0;
  };

  const getPickupSlotStatsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const slots = pickupSlotsCache[dateStr] || [];
    const totalCapacity = slots.reduce((sum, slot) => sum + slot.maxCapacity, 0);
    const currentBookings = slots.reduce((sum, slot) => sum + slot.currentBookings, 0);
    return { totalCapacity, currentBookings, slotsCount: slots.length };
  };

  // Fetch bookings (orders) data
  const fetchBookingsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersResponse, productsResponse] = await Promise.all([
        apiService.getOrders(),
        apiService.getProducts(),
      ]);

      if (ordersResponse.success) {
        const ordersList = ordersResponse.data.orders || [];

        // Transform orders to bookings format
        const transformedBookings = ordersList.map((order) => {
          const orderProducts =
            order.items?.map((item) => {
              const product = productsResponse.data.products?.find(
                (p) => p._id === item.productId
              );
              return product ? product.name : "Unknown Product";
            }) || [];

          const startDate = order.items?.[0]?.rentalDuration?.startDate
            ? new Date(
                order.items[0].rentalDuration.startDate
              ).toLocaleDateString()
            : new Date(order.createdAt).toLocaleDateString();

          const endDate = order.items?.[0]?.rentalDuration?.endDate
            ? new Date(
                order.items[0].rentalDuration.endDate
              ).toLocaleDateString()
            : "";

          const start = new Date(
            order.items?.[0]?.rentalDuration?.startDate || order.createdAt
          );
          const end = new Date(
            order.items?.[0]?.rentalDuration?.endDate || start
          );
          const diffTime = Math.abs(end - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          return {
            id: order._id,
            customer: "Customer", // We'll show customer ID for now
            product: orderProducts.join(", ") || "Multiple Items",
            startDate,
            endDate,
            duration: `${diffDays} day${diffDays !== 1 ? "s" : ""}`,
            totalAmount: `₹${order.totalAmount || 0}`,
            status:
              order.status === "reserved"
                ? "Confirmed"
                : order.status === "quotation"
                ? "Pending"
                : order.status.charAt(0).toUpperCase() + order.status.slice(1),
            pickupDate: startDate,
            returnDate: endDate,
            originalData: order,
          };
        });

        setBookings(transformedBookings);
      }

      if (productsResponse.success) {
        setProducts(productsResponse.data.products || []);
      }

      // Preload pickup slots for the current month
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const slotsResponse = await apiService.getAllPickupSlots({
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0],
        limit: 50
      });

      if (slotsResponse.success) {
        const slots = slotsResponse.data.slots || [];
        const slotsCache = {};
        
        // Group slots by date
        slots.forEach(slot => {
          const dateStr = new Date(slot.date).toISOString().split('T')[0];
          if (!slotsCache[dateStr]) {
            slotsCache[dateStr] = [];
          }
          slotsCache[dateStr].push(slot);
        });
        
        setPickupSlotsCache(slotsCache);
      }

    } catch (err) {
      setError("Failed to fetch bookings data: " + err.message);
      console.error("Bookings data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle view booking
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  // Handle edit booking
  const handleEditBooking = (booking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
  };

  // Handle generate invoice
  const handleGenerateInvoice = async (booking) => {
    try {
      // Use the booking ID from the original order data
      const orderId = booking.originalData?._id || booking.id;
      const response = await apiService.generateInvoice(orderId);

      if (response.success) {
        alert(`Invoice generated successfully for booking ${booking.id}`);
      } else {
        alert(`Failed to generate invoice: ${response.message}`);
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice. Please try again.");
    }
  };

  // Handle download invoice
  const handleDownloadInvoice = async (booking) => {
    try {
      // Use the booking ID from the original order data
      const orderId = booking.originalData?._id || booking.id;
      const response = await apiService.downloadInvoice(orderId);

      if (response.success && response.data) {
        // Handle both blob and text data
        const blob =
          response.data instanceof Blob
            ? response.data
            : new Blob([response.data], { type: "application/pdf" });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `invoice-${booking.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        alert("Invoice downloaded successfully!");
      } else {
        alert(`Failed to download invoice: ${response.message}`);
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Failed to download invoice. Please try again.");
    }
  };

  // Handle create new booking
  const handleCreateBooking = async (e) => {
    e.preventDefault();

    try {
      // Basic validation
      if (
        !newBooking.customer ||
        !newBooking.product ||
        !newBooking.startDate ||
        !newBooking.endDate
      ) {
        alert("Please fill in all required fields");
        return;
      }

      // Here you would typically call an API to create the booking
      console.log("Creating booking:", newBooking);

      // For now, just show success message and close modal
      alert("Booking created successfully!");
      setShowAddModal(false);

      // Reset form
      setNewBooking({
        customer: "",
        product: "",
        startDate: "",
        endDate: "",
      });

      // Refresh bookings data
      fetchBookingsData();
    } catch (err) {
      console.error("Error creating booking:", err);
      alert("Failed to create booking. Please try again.");
    }
  };

  useEffect(() => {
    fetchBookingsData();
  }, []);

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
          <p className="text-gray-600">
            Manage rental reservations and scheduling
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Booking
        </button>
      </div>

      {/* Main Content: Calendar and Bookings Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto">
        {/* Calendar Section */}
        <div className="bg-white rounded-lg shadow flex flex-col">
          <div className="p-6 flex-1">
            {/* React Calendar */}
            <div className="calendar-container">
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                  .calendar-container .react-calendar {
                    width: 100%;
                    background: white;
                    border: none;
                    font-family: inherit;
                    line-height: 1.125em;
                    border-radius: 12px;
                    padding: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                  }
                  
                  .react-calendar--selectRange .react-calendar__tile--hover {
                    background-color: #e6f3ff;
                  }
                  
                  .react-calendar__tile {
                    max-width: 100%;
                    padding: 12px 6px;
                    background: none;
                    text-align: center;
                    line-height: 16px;
                    font-size: 0.875rem;
                    border: none;
                    border-radius: 8px;
                    margin: 2px;
                    position: relative;
                    transition: all 0.2s ease;
                  }
                  
                  .react-calendar__tile:enabled:hover,
                  .react-calendar__tile:enabled:focus {
                    background-color: #f0f9ff;
                    transform: scale(1.05);
                  }
                  
                  .react-calendar__tile--now {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    font-weight: bold;
                    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
                  }
                  
                  .react-calendar__tile--now:enabled:hover,
                  .react-calendar__tile--now:enabled:focus {
                    background: linear-gradient(135deg, #2563eb, #1e40af);
                  }
                  
                  .react-calendar__tile--active {
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                    color: white;
                    font-weight: bold;
                  }
                  
                  .react-calendar__tile--active:enabled:hover,
                  .react-calendar__tile--active:enabled:focus {
                    background: linear-gradient(135deg, #7c3aed, #6d28d9);
                  }
                  
                  .react-calendar__navigation {
                    display: flex;
                    height: 44px;
                    margin-bottom: 1rem;
                    padding: 0 12px;
                  }
                  
                  .react-calendar__navigation button {
                    min-width: 44px;
                    background: none;
                    border: none;
                    font-size: 16px;
                    font-weight: 600;
                    color: #374151;
                    border-radius: 8px;
                    padding: 8px 12px;
                    transition: all 0.2s ease;
                  }
                  
                  .react-calendar__navigation button:enabled:hover,
                  .react-calendar__navigation button:enabled:focus {
                    background-color: #f3f4f6;
                    color: #1f2937;
                  }
                  
                  .react-calendar__navigation button[disabled] {
                    color: #9ca3af;
                  }
                  
                  .react-calendar__month-view__weekdays {
                    text-align: center;
                    text-transform: uppercase;
                    font-weight: 600;
                    font-size: 0.75rem;
                    color: #6b7280;
                    margin-bottom: 8px;
                  }
                  
                  .react-calendar__month-view__weekdays__weekday {
                    padding: 8px;
                    background: #f9fafb;
                    border-radius: 6px;
                    margin: 2px;
                  }
                  
                  .react-calendar__year-view .react-calendar__tile,
                  .react-calendar__decade-view .react-calendar__tile,
                  .react-calendar__century-view .react-calendar__tile {
                    padding: 16px 6px;
                    font-size: 0.875rem;
                  }
                `,
                }}
              />

              <Calendar
                onChange={(date) => {
                  setSelectedDate(date);
                  // Auto-fill start date when creating a new booking
                  if (showAddModal) {
                    setNewBooking((prev) => ({
                      ...prev,
                      startDate: date.toISOString().split("T")[0],
                    }));
                  }
                }}
                value={selectedDate}
                view={calendarView}
                tileContent={({ date, view }) => {
                  if (view === "month") {
                    const bookingCount = getBookingCountForDate(date);
                    const slotStats = getPickupSlotStatsForDate(date);
                    const hasSlots = slotStats.slotsCount > 0;
                    
                    return (
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Booking indicator */}
                        {bookingCount > 0 && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm">
                            {bookingCount}
                          </div>
                        )}
                        
                        {/* Pickup slot indicator */}
                        {hasSlots && (
                          <div className="absolute bottom-1 left-1 flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs text-blue-600 font-semibold">
                              {slotStats.currentBookings}/{slotStats.totalCapacity}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
                tileClassName={({ date, view }) => {
                  if (view === "month") {
                    const hasBookings = hasBookingsOnDate(date);
                    if (hasBookings) {
                      return "has-bookings";
                    }
                  }
                  return null;
                }}
              />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 my-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-700 rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Orders</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Pickup Slots</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>Selected</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="w-full flex flex-col gap-4">
              <div className="flex justify-between items-center gap-5">
                <div className="w-1/2 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {bookings.length}
                    </div>
                    <div className="text-sm text-blue-700">Total Bookings</div>
                  </div>
                </div>
                <div className="w-1/2 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {bookings.filter((b) => b.status === "Confirmed").length}
                    </div>
                    <div className="text-sm text-green-700">Confirmed</div>
                  </div>
                </div>
              </div>

              {/* Selected Date Info */}
              {selectedDate && (
                <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-3">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h4>
                  
                  {/* Orders Section */}
                  <div className="mb-3">
                    <h5 className="text-sm font-semibold text-blue-800 mb-2">📋 Orders</h5>
                    {getBookingsForDate(selectedDate).length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-blue-700">
                          {getBookingsForDate(selectedDate).length} order(s):
                        </p>
                        {getBookingsForDate(selectedDate).map(
                          (booking, index) => (
                            <div
                              key={index}
                              className="text-sm bg-white p-2 rounded border border-blue-200"
                            >
                              <span className="font-medium">
                                {booking.customer}
                              </span>{" "}
                              - {booking.product}
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-blue-700">No orders on this date</p>
                    )}
                  </div>

                  {/* Pickup Slots Section */}
                  <div>
                    <h5 className="text-sm font-semibold text-blue-800 mb-2">🕐 Pickup Slots</h5>
                    {(() => {
                      const slotStats = getPickupSlotStatsForDate(selectedDate);
                      const dateStr = selectedDate.toISOString().split('T')[0];
                      const slots = pickupSlotsCache[dateStr] || [];
                      
                      if (slots.length > 0) {
                        return (
                          <div className="space-y-2">
                            <p className="text-sm text-blue-700">
                              {slots.length} slot(s) - {slotStats.currentBookings}/{slotStats.totalCapacity} booked:
                            </p>
                            {slots.map((slot, index) => (
                              <div
                                key={index}
                                className="text-sm bg-white p-2 rounded border border-blue-200 flex justify-between items-center"
                              >
                                <span>
                                  {slot.timeSlot.startTime} - {slot.timeSlot.endTime}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  slot.currentBookings === slot.maxCapacity 
                                    ? 'bg-red-100 text-red-800' 
                                    : slot.currentBookings > slot.maxCapacity * 0.7 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {slot.currentBookings}/{slot.maxCapacity}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      } else {
                        return <p className="text-sm text-blue-700">No pickup slots on this date</p>;
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Bookings Section */}
        <div className="bg-white rounded-lg shadow flex flex-col h-auto overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0 ">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Bookings
              </h2>
              <div className="text-sm text-gray-500">
                {loading ? "Loading..." : `${bookings.length} total`}
              </div>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
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
                  <span className="mt-2 text-gray-600 text-sm">
                    Loading bookings...
                  </span>
                </div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No bookings found
                  </h3>
                  <p className="text-gray-600">
                    Bookings will appear here once customers make reservations
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto">
                <div className="p-4 space-y-3">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {booking.customer}
                            </h4>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                booking.status === "Confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
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
                              <span className="font-medium text-gray-900">
                                {booking.duration}
                              </span>
                            </div>
                            <div className="text-sm font-bold text-gray-900">
                              {booking.totalAmount}
                            </div>
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden relative">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0"></div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full"></div>

              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Create New Booking
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Schedule a new rental reservation
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 max-h-[calc(95vh-120px)] overflow-y-auto">
              <form onSubmit={handleCreateBooking} className="space-y-6">
                {/* Customer & Product Section */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    Customer & Product Selection
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Customer *
                      </label>
                      <div className="relative">
                        <select
                          value={newBooking.customer}
                          onChange={(e) =>
                            setNewBooking({
                              ...newBooking,
                              customer: e.target.value,
                            })
                          }
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/50 backdrop-blur-sm appearance-none"
                          required
                        >
                          <option value="">Choose a customer</option>
                          <option value="customer1">👤 John Doe</option>
                          <option value="customer2">👤 Jane Smith</option>
                          <option value="customer3">👤 Mike Johnson</option>
                          <option value="customer4">👤 Sarah Wilson</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product *
                      </label>
                      <div className="relative">
                        <select
                          value={newBooking.product}
                          onChange={(e) =>
                            setNewBooking({
                              ...newBooking,
                              product: e.target.value,
                            })
                          }
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/50 backdrop-blur-sm appearance-none"
                          required
                        >
                          <option value="">Choose a product</option>
                          {products.map((product) => (
                            <option key={product._id} value={product._id}>
                              🔨 {product.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Selection Section */}
                <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    Rental Duration
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={newBooking.startDate}
                          onChange={(e) =>
                            setNewBooking({
                              ...newBooking,
                              startDate: e.target.value,
                            })
                          }
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          📅
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        End Date *
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={newBooking.endDate}
                          onChange={(e) =>
                            setNewBooking({
                              ...newBooking,
                              endDate: e.target.value,
                            })
                          }
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          min={
                            newBooking.startDate ||
                            new Date().toISOString().split("T")[0]
                          }
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          📅
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Duration Helper */}
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <p className="text-sm text-purple-700 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      💡 Tip: Select dates to automatically calculate rental
                      duration and pricing
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 transform hover:scale-105 border border-gray-300"
                  >
                    <span className="flex items-center justify-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Cancel
                    </span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center justify-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Create Booking
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Booking Modal */}
      {showViewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Booking Details
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Complete booking information and status
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedBooking(null);
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Customer & Status Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center mr-2">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    Customer Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg border">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Customer Name
                      </label>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedBooking.customer}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Booking Status
                      </label>
                      <span
                        className={`inline-flex items-center px-2 py-1 text-sm font-medium rounded-lg ${
                          selectedBooking.status === "Confirmed"
                            ? "bg-green-100 text-green-800"
                            : selectedBooking.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-1 ${
                            selectedBooking.status === "Confirmed"
                              ? "bg-green-500"
                              : selectedBooking.status === "Pending"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        {selectedBooking.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product Information Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center mr-2">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    Product Details
                  </h3>

                  <div className="bg-white p-3 rounded-lg border">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Product/Equipment
                    </label>
                    <p className="text-base font-semibold text-gray-900">
                      {selectedBooking.product}
                    </p>
                  </div>
                </div>

                {/* Rental Duration Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center mr-2">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    Rental Period
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-lg border">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Pickup Date
                      </label>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedBooking.pickupDate}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Return Date
                      </label>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedBooking.returnDate}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Duration
                      </label>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedBooking.duration}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Information Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center mr-2">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                    Payment Details
                  </h3>

                  <div className="bg-white p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-600">
                        Total Amount
                      </label>
                      <span className="text-xl font-bold text-green-600">
                        {selectedBooking.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                {/* Invoice Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleGenerateInvoice(selectedBooking)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Generate Invoice
                  </button>
                  <button
                    onClick={() => handleDownloadInvoice(selectedBooking)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download Invoice
                  </button>
                </div>

                {/* Edit and Close Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditBooking(selectedBooking)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedBooking(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden relative">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 px-8 py-6 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full"></div>

              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Edit Booking
                  </h2>
                  <p className="text-orange-100 text-sm">
                    Update booking details and status
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedBooking(null);
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 max-h-[calc(95vh-120px)] overflow-y-auto">
              <form className="space-y-6">
                {/* Status Section */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    Booking Status
                  </h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Update Status
                    </label>
                    <div className="relative">
                      <select
                        defaultValue={selectedBooking.status}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/50 backdrop-blur-sm appearance-none"
                      >
                        <option value="Confirmed">✅ Confirmed</option>
                        <option value="Pending">⏳ Pending</option>
                        <option value="Cancelled">❌ Cancelled</option>
                        <option value="Completed">🎉 Completed</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Section */}
                <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    Rental Period
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pickup Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          defaultValue={
                            new Date(selectedBooking.pickupDate)
                              .toISOString()
                              .split("T")[0]
                          }
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          📅
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Return Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          defaultValue={
                            new Date(selectedBooking.returnDate)
                              .toISOString()
                              .split("T")[0]
                          }
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          📅
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date Helper */}
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <p className="text-sm text-purple-700 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      💡 Tip: Changing dates will automatically recalculate the
                      rental duration and pricing
                    </p>
                  </div>
                </div>

                {/* Current Booking Info */}
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    Current Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-500 mb-1">
                        Customer
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedBooking.customer}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-500 mb-1">
                        Product
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedBooking.product}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-500 mb-1">
                        Duration
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedBooking.duration}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-500 mb-1">
                        Total Amount
                      </label>
                      <p className="text-sm font-bold text-gray-900">
                        {selectedBooking.totalAmount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedBooking(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 transform hover:scale-105 border border-gray-300"
                  >
                    <span className="flex items-center justify-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Cancel
                    </span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-orange-700 hover:via-amber-700 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center justify-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Save Changes
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;