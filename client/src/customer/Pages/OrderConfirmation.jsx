import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get order and product data from location state
  const order = location.state?.order;
  const product = location.state?.product;
  
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
          <div className="flex items-center justify-center space-x-8 mb-12">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                ✓
              </div>
              <span className="text-green-600 font-medium">Equipment Selected</span>
            </div>
            <div className="w-8 h-1 bg-green-500 rounded"></div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                ✓
              </div>
              <span className="text-green-600 font-medium">Payment Completed</span>
            </div>
            <div className="w-8 h-1 bg-green-500 rounded"></div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                ✓
              </div>
              <span className="text-green-600 font-medium">Booking Confirmed</span>
            </div>
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
              <div className="bg-blue-50 rounded-xl p-4">
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
              <li>• Our team will contact you within 2-4 hours to coordinate delivery</li>
              <li>• Please ensure someone is available at the delivery address during the scheduled time</li>
              <li>• Security deposit will be refunded after equipment return in good condition</li>
              <li>• For any queries, contact our support team at support@renthive.com</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;