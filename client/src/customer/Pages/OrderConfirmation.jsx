import React from 'react';
import { FiFileText, FiCalendar, FiTag, FiCreditCard, FiChevronLeft } from 'react-icons/fi';

const OrderConfirmation = () => {
  const orderDetails = [
    { icon: FiFileText, label: 'Order ID', value: '245-292-22QR' },
    { icon: FiCalendar, label: 'Date', value: '01.07.2024' },
    { icon: FiTag, label: 'Total', value: '$42' },
    { icon: FiCreditCard, label: 'Payment', value: 'Cash on delivery' }
  ];

  const orderedItems = [
    { id: 1, image: '🪑', quantity: 1 },
    { id: 2, image: '📷', quantity: 2 },
    { id: 3, image: '🛋️', quantity: 1 }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          {/* Progress Indicator */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span className="text-green-500 font-medium underline">Shopping Cart</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-green-500 font-medium underline">Checkout Info</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                3
              </div>
              <span className="text-white font-medium underline">Billing Details</span>
            </div>
          </div>
          
          {/* Navigation Button */}
          <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
            <FiChevronLeft className="w-4 h-4" />
            <span>Get Home</span>
          </button>
        </div>

        {/* Main Content - Order Confirmation Card */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-800 rounded-2xl overflow-hidden">
            <div className="flex">
              {/* Left Panel - Order Details */}
              <div className="flex-1 p-8">
                {/* Confirmation Message */}
                <div className="mb-8">
                  <p className="text-gray-400 text-lg mb-2">Thank you! 🎉</p>
                  <h2 className="text-3xl font-bold">We have registered your order</h2>
                </div>

                {/* Ordered Items Thumbnails */}
                <div className="flex space-x-4 mb-8">
                  {orderedItems.map((item) => (
                    <div key={item.id} className="relative">
                      <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center text-3xl">
                        {item.image}
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-gray-900 text-xs font-bold">{item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Information List */}
                <div className="space-y-4 mb-8">
                  {orderDetails.map((detail, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                        <detail.icon className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="text-gray-400">{detail.label}:</span>
                      <span className="font-medium">{detail.value}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button className="bg-green-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors">
                  Payment History
                </button>
              </div>

              {/* Right Panel - Abstract Art Image */}
              <div className="w-96 bg-gradient-to-br from-yellow-50 to-orange-100 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-48 h-64 bg-gradient-to-br from-gray-800 via-blue-600 to-red-500 rounded-lg relative overflow-hidden">
                    {/* Abstract Art Representation */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 opacity-80"></div>
                    <div className="absolute inset-0">
                      {/* Face outline */}
                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-24 h-32 border-4 border-gray-800 rounded-full"></div>
                      {/* Paint splatters */}
                      <div className="absolute top-4 left-8 w-8 h-8 bg-blue-500 rounded-full opacity-80"></div>
                      <div className="absolute top-16 right-6 w-6 h-6 bg-red-500 rounded-full opacity-80"></div>
                      <div className="absolute bottom-8 left-12 w-10 h-10 bg-yellow-400 rounded-full opacity-80"></div>
                      <div className="absolute bottom-16 right-8 w-4 h-4 bg-white rounded-full opacity-80"></div>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-4 text-sm">Abstract Art</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
