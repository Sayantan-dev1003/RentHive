import React from "react";
import { FaChevronLeft, FaIdBadge, FaCalendarAlt, FaCreditCard, FaFileAlt } from "react-icons/fa";

export default function OrderRegistered() {
  return (
    <div className="bg-[#121212] text-white font-[Poppins] min-h-screen py-10 px-4">
      <div className="max-w-[1024px] mx-auto">
        {/* Steps Navigation */}
        <nav className="flex flex-wrap gap-10 items-center mb-10">
          {/* Step 1 */}
          <div className="flex flex-col min-w-[120px] border-b-2 border-[#3a8e0e] pb-2">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-[#3a8e0e] text-white flex items-center justify-center text-sm font-semibold mr-2">
                1
              </div>
              <span className="font-semibold text-sm">Shopping Cart</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col min-w-[120px] border-b-2 border-[#3a8e0e] pb-2">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-[#3a8e0e] text-white flex items-center justify-center text-sm font-semibold mr-2">
                2
              </div>
              <span className="font-semibold text-sm">Checkout Info</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col min-w-[120px] border-b-2 border-[#555] pb-2">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-white text-[#121212] flex items-center justify-center text-sm font-semibold mr-2">
                3
              </div>
              <span className="font-semibold text-sm">Billing Details</span>
            </div>
          </div>

          {/* Get Home Button */}
          <button className="ml-auto flex items-center gap-2 bg-transparent border border-[#222] rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#222] hover:border-[#3a8e0e] transition">
            <FaChevronLeft />
            Get Home
          </button>
        </nav>

        {/* Main Card */}
        <section className="bg-[#292929] rounded-2xl p-8 flex flex-wrap gap-10 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
          {/* Left Side */}
          <div className="flex-1 min-w-[280px]">
            <div className="text-[#999] text-sm mb-2">
              Thank you! <span className="ml-1">🎉</span>
            </div>
            <h1 className="text-2xl font-bold leading-snug mb-6">
              We have registered <br /> your order
            </h1>

            {/* Product Images */}
            <div className="flex gap-4 mb-6">
              {/* Product 1 */}
              <div className="relative w-16 h-16 bg-white rounded overflow-hidden">
                <img
                  src="https://storage.googleapis.com/a1aa/image/59a87810-affe-47ed-1152-7a639b9499c9.jpg"
                  alt="Modern chair"
                  className="w-full h-full object-contain"
                />
                <div className="absolute -top-1.5 -right-1.5 bg-white text-[#121212] font-semibold text-xs w-[22px] h-[22px] rounded-full flex items-center justify-center shadow">
                  1
                </div>
              </div>

              {/* Product 2 */}
              <div className="relative w-16 h-16 bg-white rounded overflow-hidden">
                <img
                  src="https://storage.googleapis.com/a1aa/image/921191b0-399b-4be3-6ad3-383e281aa89d.jpg"
                  alt="Black camera"
                  className="w-full h-full object-contain"
                />
                <div className="absolute -top-1.5 -right-1.5 bg-white text-[#121212] font-semibold text-xs w-[22px] h-[22px] rounded-full flex items-center justify-center shadow">
                  2
                </div>
              </div>

              {/* Product 3 */}
              <div className="relative w-16 h-16 bg-white rounded overflow-hidden">
                <img
                  src="https://storage.googleapis.com/a1aa/image/299327f4-669d-4caa-6f99-501673b1cc0f.jpg"
                  alt="Beige sofa"
                  className="w-full h-full object-contain"
                />
                <div className="absolute -top-1.5 -right-1.5 bg-white text-[#121212] font-semibold text-xs w-[22px] h-[22px] rounded-full flex items-center justify-center shadow">
                  1
                </div>
              </div>
            </div>

            {/* Order Details */}
            <ul className="text-[#999] text-sm mb-8 space-y-3">
              <li className="flex items-center gap-3">
                <FaIdBadge className="text-[#666]" />
                <span className="min-w-[70px]">Order ID</span>
                <span className="font-semibold text-white">245-292-22QR</span>
              </li>
              <li className="flex items-center gap-3">
                <FaCalendarAlt className="text-[#666]" />
                <span className="min-w-[70px]">Date</span>
                <span className="font-semibold text-white">01.07.2024</span>
              </li>
              <li className="flex items-center gap-3">
                <FaCreditCard className="text-[#666]" />
                <span className="min-w-[70px]">Total</span>
                <span className="font-semibold text-white">$42</span>
              </li>
              <li className="flex items-center gap-3">
                <FaFileAlt className="text-[#666]" />
                <span className="min-w-[70px]">Payment</span>
                <span className="font-semibold text-white">Cash on delivery</span>
              </li>
            </ul>

            {/* Payment History Button */}
            <button className="bg-[#3a8e0e] hover:bg-[#2f6c0a] text-white font-semibold text-sm px-6 py-2.5 rounded-full">
              Payment History
            </button>
          </div>

          {/* Right Side */}
          <div className="flex-1 min-w-[280px] flex items-center justify-center">
            <img
              src="https://storage.googleapis.com/a1aa/image/03624c79-8261-4d40-7ee6-e4704e9c2800.jpg"
              alt="Abstract painting"
              className="w-full max-w-[320px] rounded-2xl object-cover"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
