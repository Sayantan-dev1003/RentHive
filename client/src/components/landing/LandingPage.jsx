import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';
import FAQ from './FAQ';
import Footer from './Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <FAQ />
      <Footer />
    </div>
  );
};

export default LandingPage;
