import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqs = [
    {
      question: "How do I get started with RentHive?",
      answer: "Getting started is simple! Sign up for a free account, add your rental products with details and pricing, and start accepting bookings. Our setup wizard will guide you through the entire process in just a few minutes."
    },
    {
      question: "What types of rental businesses can use RentHive?",
      answer: "RentHive works for all types of rental businesses including equipment rentals, party supplies, electronics, furniture, vehicles, sports equipment, and more. Our flexible platform adapts to your specific industry needs."
    },
    {
      question: "How does the payment processing work?",
      answer: "We offer secure payment processing with multiple payment options including credit cards, UPI, and bank transfers. Payments are automatically processed and deposited into your account. You can also set up security deposits and partial payments."
    },
    {
      question: "Can I track my inventory in real-time?",
      answer: "Yes! RentHive provides real-time inventory tracking. You'll always know what's available, what's rented out, and when items are due to be returned. Get automated alerts for low stock and overdue items."
    },
    {
      question: "Is there customer support available?",
      answer: "Absolutely! We provide comprehensive customer support through email, chat, and phone. Our support team is available to help you with setup, troubleshooting, and any questions about using the platform effectively."
    },
    {
      question: "Can I customize the booking experience for my customers?",
      answer: "Yes, you can customize your booking portal with your branding, colors, and logo. You can also set custom fields, rental terms, and create a personalized experience that matches your business."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Got questions? We've got answers. If you can't find what you're looking for, 
            feel free to contact our support team.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-6 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset rounded-2xl"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openItems.has(index) ? (
                    <ChevronUp className="h-5 w-5 text-indigo-600 transform transition-transform duration-200" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 transform transition-transform duration-200" />
                  )}
                </div>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openItems.has(index) 
                    ? 'max-h-96 opacity-100' 
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6">
                  <div className="h-px bg-gray-200 mb-4"></div>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our support team is here to help. Get in touch and we'll get back to you as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:support@renthive.com"
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 hover:scale-105 transition-all duration-200 font-medium"
              >
                Email Support
              </a>
              <a 
                href="#contact"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all duration-200 font-medium"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
