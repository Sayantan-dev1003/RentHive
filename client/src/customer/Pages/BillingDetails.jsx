import React, { useState } from 'react';
import { FiCheck, FiChevronLeft } from 'react-icons/fi';

const BillingDetails = () => {
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardNumber, setCardNumber] = useState('2644 5112 2211 1456');
  const [cardHolder, setCardHolder] = useState('Jason Joe');
  const [expiryDate, setExpiryDate] = useState('03/27');
  const [cvv, setCvv] = useState('1256');
  const [saveCard, setSaveCard] = useState(true);

  const orderItems = [
    { id: 1, name: "T-shirts for men's", quantity: 1, price: 12.00, image: '👕' },
    { id: 2, name: "T-shirts for men's", quantity: 1, price: 12.00, image: '👕' },
    { id: 3, name: "T-shirts for men's", quantity: 1, price: 12.00, image: '👕' }
  ];

  const orderTotal = orderItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">E-commerce Checkout</h1>
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span className="text-green-500 font-medium">Shopping Cart</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-green-500 font-medium">Checkout Info</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                3
              </div>
              <span className="text-white font-medium underline">Billing Details</span>
            </div>
          </div>
          
          <a href="#" className="text-gray-400 hover:text-white flex items-center space-x-2">
            <FiChevronLeft className="w-4 h-4" />
            <span>Your Cart</span>
          </a>
        </div>

        <div className="flex gap-8">
          {/* Left Section - Payment Details */}
          <div className="flex-1 bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Payment Details</h2>
            
            {/* Payment Method Selection */}
            <div className="mb-6">
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    paymentMethod === 'cash' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Cash on delivery
                </button>
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    paymentMethod === 'paypal' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Paypal
                </button>
                <button
                  onClick={() => setPaymentMethod('credit-card')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    paymentMethod === 'credit-card' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Credit card
                </button>
              </div>
            </div>

            {/* Credit Card Form */}
            {paymentMethod === 'credit-card' && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <h3 className="text-lg font-semibold">Credit Card</h3>
                  <div className="flex space-x-2">
                    <div className="w-8 h-4 bg-blue-600 rounded text-xs text-white flex items-center justify-center font-bold">
                      MC
                    </div>
                    <div className="w-8 h-4 bg-blue-800 rounded text-xs text-white flex items-center justify-center font-bold">
                      VISA
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">CARD NUMBER</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                      />
                      <FiCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">CARD HOLDER</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">EXPIRY DATE</label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <label className="text-sm font-medium">Save this Credit card</label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Section - Order Summary */}
          <div className="w-80 bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Your Order</h2>
            
            <div className="space-y-4 mb-6">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center text-2xl">
                    {item.image}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-400">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-gray-700 pt-4">
              <div className="flex justify-between">
                <span>Sub-Total</span>
                <span>${orderTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>$6.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-green-500">
                <span>Total</span>
                <span>${(orderTotal + 6).toFixed(2)}</span>
              </div>
            </div>

            <button className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors mt-6">
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingDetails;
