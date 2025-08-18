import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get order and product data from location state
  const order = location.state?.order;
  const product = location.state?.product;
  const pickupSlot = location.state?.pickupSlot;
  const isPickupScheduled = location.state?.isPickupScheduled;
  
  // Generate order ID if not provided
  const orderId = order?.orderId || `RH-${Date.now().toString(36).toUpperCase()}`;
  
  const orderDetails = [
    { icon: '📄', label: 'Order ID', value: orderId },
    { icon: '📅', label: 'Booking Date', value: new Date().toLocaleDateString() },
    { icon: '💰', label: 'Total Amount', value: `₹${order?.totalAmount || 0}` },
    { icon: '💳', label: 'Payment Method', value: order?.paymentMethod === 'card' ? 'Credit/Debit Card' : order?.paymentMethod?.toUpperCase() || 'Card' }
  ];

  // If no order data, redirect back to gallery
  if (!order || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">Please complete a booking to view confirmation.</p>
          <button
            onClick={() => navigate('/customer/customer-dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Equipment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-lg text-gray-600">Your equipment rental has been successfully booked.</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-12 overflow-x-auto">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                ✓
              </div>
              <span className="text-green-600 font-medium text-sm">Equipment Selected</span>
            </div>
            <div className="w-6 h-1 bg-green-500 rounded"></div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                ✓
              </div>
              <span className="text-green-600 font-medium text-sm">Payment Completed</span>
            </div>
            <div className="w-6 h-1 bg-green-500 rounded"></div>
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 ${isPickupScheduled ? 'bg-green-500' : 'bg-green-500'} rounded-full flex items-center justify-center text-sm font-bold text-white`}>
                ✓
              </div>
              <span className={`${isPickupScheduled ? 'text-green-600' : 'text-green-600'} font-medium text-sm`}>
                {isPickupScheduled ? 'Pickup Scheduled' : 'Booking Confirmed'}
              </span>
            </div>
            {isPickupScheduled && (
              <>
                <div className="w-6 h-1 bg-green-500 rounded"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    📅
                  </div>
                  <span className="text-blue-600 font-medium text-sm">Ready for Pickup</span>
                </div>
              </>
            )}
          </div>

          {/* Main Content - Order Confirmation Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Equipment Details Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Equipment Details</h2>
              
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/400x300/f3f4f6/6b7280?text=${encodeURIComponent(product.name)}`;
                  }}
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2">{product.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">{product.price}/day</span>
                  <span className="text-sm text-gray-500">⭐ {product.rating}</span>
                </div>
              </div>

              {/* Rental Period */}
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Rental Period</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Start Date</span>
                    <p className="font-semibold">{order.startDate}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">End Date</span>
                    <p className="font-semibold">{order.endDate}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <span className="text-sm text-gray-600">Duration</span>
                  <p className="font-semibold">{order.duration} day(s)</p>
                </div>
              </div>

              {/* Pickup Information */}
              {isPickupScheduled && pickupSlot ? (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    🕐 Pickup Schedule
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Confirmed</span>
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Pickup Date</span>
                      <p className="font-semibold text-green-700">
                        {new Date(pickupSlot.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Time Slot</span>
                      <p className="font-semibold text-green-700">
                        {pickupSlot.timeSlot.startTime} - {pickupSlot.timeSlot.endTime}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Location</span>
                      <p className="font-semibold">{pickupSlot.location.name}</p>
                      <p className="text-sm text-gray-500">{pickupSlot.location.address}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    ⏳ Next Step: Schedule Pickup
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Your payment is confirmed! Please schedule a pickup slot to complete your booking.
                  </p>
                  <button
                    onClick={() => navigate('/customer/pickup-slot-selection', {
                      state: { order, product }
                    })}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Schedule Pickup Time
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Order Details */}
              <div className="space-y-4 mb-6">
                {orderDetails.map((detail, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{detail.icon}</span>
                      <span className="text-gray-600">{detail.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{detail.value}</span>
                  </div>
                ))}
              </div>

              {/* Billing Details */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Billing Details</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Name:</span> {order.billingDetails?.fullName}</p>
                  <p><span className="text-gray-600">Email:</span> {order.billingDetails?.email}</p>
                  <p><span className="text-gray-600">Phone:</span> {order.billingDetails?.phone}</p>
                  <p><span className="text-gray-600">Address:</span> {order.billingDetails?.address}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/customer/customer-dashboard')}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  🏠 Back to Equipment Gallery
                </button>
                <button
                  onClick={() => navigate('/customer/orders')}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  📋 View All Orders
                </button>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">📋 Important Information</h3>
            <ul className="text-yellow-700 space-y-2 text-sm">
              <li>• A confirmation email has been sent to your registered email address</li>
              {isPickupScheduled ? (
                <>
                  <li>• <strong>Pickup scheduled:</strong> Please arrive during your selected time slot</li>
                  <li>• Bring a valid ID and this confirmation for equipment pickup</li>
                  <li>• Contact us immediately if you need to reschedule your pickup</li>
                </>
              ) : (
                <>
                  <li>• <strong>Next step:</strong> Schedule your pickup time to complete the booking</li>
                  <li>• Pickup slots are available Monday to Saturday, 9 AM to 6 PM</li>
                </>
              )}
              <li>• Security deposit will be refunded after equipment return in good condition</li>
              <li>• Equipment must be returned on or before the end date to avoid late fees</li>
              <li>• For any queries, contact our support team at support@renthive.com</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;