import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiCheck, FiStar, FiUsers, FiShield, FiClock } from 'react-icons/fi'

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="RentHive" className="h-8 w-8" />
          <span className="text-xl font-bold text-slate-900">RentHive</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link 
            to="/signin" 
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            Sign In
          </Link>
          <Link 
            to="/signup" 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Simplify Your
            <span className="text-indigo-600"> Rental Business</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Streamline your rental operations with our comprehensive management platform. 
            Track inventory, manage bookings, process payments, and grow your business effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/signup"
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              Get Started Free
              <FiArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/signin"
              className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-slate-400 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Everything You Need to Manage Rentals
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-white/20">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Customer Management</h3>
              <p className="text-slate-600">
                Manage customer profiles, track rental history, and build lasting relationships.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-white/20">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Secure Payments</h3>
              <p className="text-slate-600">
                Process payments securely with multiple payment options and automated invoicing.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-white/20">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiClock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Real-time Tracking</h3>
              <p className="text-slate-600">
                Monitor inventory availability, track bookings, and get real-time updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Why Choose RentHive?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiCheck className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Easy Setup</h3>
                    <p className="text-slate-600">Get started in minutes with our intuitive setup process.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheck className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Automated Workflows</h3>
                    <p className="text-slate-600">Streamline operations with automated reminders and notifications.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheck className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Comprehensive Reports</h3>
                    <p className="text-slate-600">Make data-driven decisions with detailed analytics and reports.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheck className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">24/7 Support</h3>
                    <p className="text-slate-600">Get help whenever you need it with our dedicated support team.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Start Your Free Trial</h3>
                <p className="text-indigo-100 mb-6">
                  Join thousands of businesses already using RentHive to streamline their rental operations.
                </p>
                <Link 
                  to="/signup"
                  className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
                >
                  Get Started Now
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-16 bg-white/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">
            Trusted by Rental Businesses
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-white/20">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-600 mb-4">
                "RentHive transformed our rental business. We've increased efficiency by 40% and our customers love the seamless experience."
              </p>
              <div className="font-semibold text-slate-900">Sarah Johnson</div>
              <div className="text-sm text-slate-500">Equipment Rentals Co.</div>
            </div>
            
            <div className="p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-white/20">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-600 mb-4">
                "The automated notifications and payment processing have saved us countless hours. Highly recommended!"
              </p>
              <div className="font-semibold text-slate-900">Mike Chen</div>
              <div className="text-sm text-slate-500">Party Rentals Plus</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Rental Business?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of successful rental businesses. Start your free trial today.
          </p>
          <Link 
            to="/signup"
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all transform hover:scale-105 inline-flex items-center gap-2"
          >
            Get Started Free
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto text-center text-slate-600">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img src="/logo.png" alt="RentHive" className="h-6 w-6" />
            <span className="font-semibold text-slate-900">RentHive</span>
          </div>
          <p>&copy; 2024 RentHive. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
