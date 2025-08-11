import React from 'react';
import { Check, Star } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Basic',
      price: '₹999',
      period: '/month',
      description: 'Perfect for small rental businesses',
      features: [
        'Up to 50 products',
        'Basic booking system',
        'Email support',
        'Mobile responsive',
        'Basic analytics',
        'Secure payments'
      ],
      buttonText: 'Start Basic',
      buttonStyle: 'border border-gray-300 text-gray-700 hover:border-indigo-300 hover:text-indigo-600'
    },
    {
      name: 'Pro',
      price: '₹2,499',
      period: '/month',
      description: 'Best for growing rental businesses',
      popular: true,
      features: [
        'Up to 500 products',
        'Advanced booking system',
        'Priority support',
        'Custom branding',
        'Advanced analytics',
        'Multiple payment methods',
        'Automated reminders',
        'Inventory management',
        'Customer management'
      ],
      buttonText: 'Start Pro',
      buttonStyle: 'bg-indigo-600 text-white hover:bg-indigo-700'
    },
    {
      name: 'Enterprise',
      price: '₹4,999',
      period: '/month',
      description: 'For large rental operations',
      features: [
        'Unlimited products',
        'Full-featured system',
        '24/7 phone support',
        'White-label solution',
        'Custom integrations',
        'Advanced reporting',
        'Multi-location support',
        'API access',
        'Dedicated account manager',
        'Custom training'
      ],
      buttonText: 'Contact Sales',
      buttonStyle: 'border border-gray-300 text-gray-700 hover:border-indigo-300 hover:text-indigo-600'
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your business size. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.popular 
                  ? 'border-indigo-500 bg-gradient-to-b from-indigo-50 to-white' 
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-1">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${plan.buttonStyle}`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently asked questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is there a setup fee?</h4>
              <p className="text-gray-600">No, there are no setup fees. You only pay the monthly subscription cost.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time with immediate effect.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
              <p className="text-gray-600">Yes, all plans come with a 14-day free trial. No credit card required.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600">We accept all major credit cards, UPI, and bank transfers for Indian customers.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
