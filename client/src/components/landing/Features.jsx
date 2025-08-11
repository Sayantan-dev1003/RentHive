import React from 'react';
import { Package, CreditCard, Clock, Settings, Shield, BarChart3, Users, Smartphone } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Package,
      title: 'Rental Product Management',
      description: 'Easily add, edit, and organize your rental inventory with detailed product information, pricing, and availability tracking.',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      icon: CreditCard,
      title: 'Online Booking & Payments',
      description: 'Accept bookings and payments online with secure payment processing and automated invoice generation.',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: Clock,
      title: 'Real-time Availability',
      description: 'Track product availability in real-time with automatic updates when items are booked or returned.',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Settings,
      title: 'Custom Pricing',
      description: 'Set flexible pricing models with hourly, daily, weekly, and monthly rates. Apply seasonal discounts and special offers.',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Bank-level security with encrypted data storage and secure payment processing to protect your business.',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Get insights into your rental business with detailed reports on revenue, popular items, and customer trends.',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Users,
      title: 'Customer Management',
      description: 'Manage customer profiles, rental history, and communication all in one centralized platform.',
      color: 'from-teal-500 to-green-600'
    },
    {
      icon: Smartphone,
      title: 'Mobile Responsive',
      description: 'Access your rental management system from anywhere with our fully responsive mobile-friendly interface.',
      color: 'from-pink-500 to-rose-600'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to manage rentals
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Powerful features designed to streamline your rental business operations 
            and help you grow faster with better customer experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index} 
                className="group p-6 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>


      </div>
    </section>
  );
};

export default Features;
