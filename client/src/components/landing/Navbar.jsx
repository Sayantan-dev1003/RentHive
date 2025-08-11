import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Package } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">RentHive</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-indigo-600 transition-colors">Home</a>
            <a href="#features" className="text-gray-700 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#contact" className="text-gray-700 hover:text-indigo-600 transition-colors">Contact</a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/signin" 
              className="text-gray-700 hover:text-indigo-600 transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 hover:scale-105 transition-all duration-200 shadow-md"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-indigo-600 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#home" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition-colors">Home</a>
              <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#contact" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition-colors">Contact</a>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <Link 
                  to="/signin" 
                  className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="block mx-3 mt-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors text-center"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
