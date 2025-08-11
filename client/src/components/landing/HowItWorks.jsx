import React from 'react';
import { Plus, Globe, CreditCard } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Plus,
      title: 'List Your Products',
      description: 'Add your rental items with photos, descriptions, and pricing. Set availability and rental terms.',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      icon: Globe,
      title: 'Customers Book Online',
      description: 'Customers browse your inventory, check availability, and book items through your online portal.',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: CreditCard,
      title: 'Get Paid & Track Returns',
      description: 'Receive payments automatically, track rentals, and manage returns with automated reminders.',
      color: 'from-blue-500 to-cyan-600'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get started with RentHive in three simple steps and transform your rental business today.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="text-center relative">
                {/* Connector Line (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-indigo-200 to-cyan-200 transform translate-x-12"></div>
                )}

                {/* Step Number */}
                <div className="relative z-10 w-32 h-32 mx-auto mb-6 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center`}>
                    <IconComponent className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

  
      </div>
    </section>
  );
};

export default HowItWorks;
