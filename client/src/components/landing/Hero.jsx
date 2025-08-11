import React from 'react';
import { ArrowRight, Play } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="pt-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Streamline Your{' '}
              <span className="text-indigo-600">Rentals</span>{' '}
              with Ease
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
              Manage products, track availability, and handle bookings — all in one place. 
              Perfect for rental businesses looking to grow and modernize their operations.
            </p>
            
            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all duration-200 flex items-center justify-center">
                <Play className="mr-2 h-5 w-5" />
                Learn More
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12">
              <p className="text-sm text-gray-500 mb-4">Trusted by 500+ rental businesses</p>
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-8 opacity-60">
                <div className="bg-gray-200 px-6 py-2 rounded-lg text-gray-600 font-semibold">TechCorp</div>
                <div className="bg-gray-200 px-6 py-2 rounded-lg text-gray-600 font-semibold">RentPro</div>
                <div className="bg-gray-200 px-6 py-2 rounded-lg text-gray-600 font-semibold">QuickRent</div>
                <div className="bg-gray-200 px-6 py-2 rounded-lg text-gray-600 font-semibold">FlexLease</div>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-indigo-100 to-cyan-100 rounded-3xl p-8 shadow-2xl">
              {/* Dashboard Mockup */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-600 px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="ml-4 text-white text-sm font-medium">RentHive Dashboard</div>
                  </div>
                </div>
                
                {/* Dashboard Content */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-indigo-400 to-purple-500 p-4 rounded-xl text-white">
                      <div className="text-2xl font-bold">₹45,280</div>
                      <div className="text-sm opacity-90">Monthly Revenue</div>
                    </div>
                    <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-4 rounded-xl text-white">
                      <div className="text-2xl font-bold">128</div>
                      <div className="text-sm opacity-90">Active Rentals</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-200 rounded-lg"></div>
                        <div>
                          <div className="font-medium text-gray-900">Canon DSLR Camera</div>
                          <div className="text-sm text-gray-500">Available</div>
                        </div>
                      </div>
                                                <div className="text-indigo-600 font-medium">₹2,500/day</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-200 rounded-lg"></div>
                        <div>
                          <div className="font-medium text-gray-900">MacBook Pro</div>
                          <div className="text-sm text-gray-500">Rented until Dec 15</div>
                        </div>
                      </div>
                      <div className="text-orange-600 font-medium">₹5,000/day</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-cyan-500 text-white p-3 rounded-xl shadow-lg">
              <div className="text-sm font-medium">Real-time Updates</div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-indigo-500 text-white p-3 rounded-xl shadow-lg">
              <div className="text-sm font-medium">Smart Analytics</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
