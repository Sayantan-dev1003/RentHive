import React from 'react';
import { Package, Mail, Phone, MapPin, Twitter, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="h-8 w-8 text-indigo-400" />
              <span className="text-2xl font-bold">RentHive</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              The ultimate rental management platform that helps businesses streamline their operations, 
              increase efficiency, and grow their revenue through smart automation and analytics.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-indigo-400" />
                <span className="text-gray-400">support@renthive.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-indigo-400" />
                <span className="text-gray-400">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-indigo-400" />
                <span className="text-gray-400">Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-400 hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">API Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Integrations</a></li>
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Security</a></li>
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Getting Started</a></li>
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Contact Support</a></li>
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">System Status</a></li>
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Bug Reports</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright */}
            <div className="text-gray-400 mb-4 md:mb-0">
              <p>&copy; 2024 RentHive. All rights reserved.</p>
            </div>

            {/* Social Links */}
            <div className="flex space-x-6">
              <a 
                href="#" 
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-6 w-6" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Legal Links */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex flex-wrap justify-center space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Cookie Policy</a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">GDPR</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
