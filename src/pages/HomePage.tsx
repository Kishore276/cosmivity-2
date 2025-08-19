import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BgGradient } from '@/components/ui/bg-gradient';
import { motion } from 'framer-motion';
import React from 'react';
import { Logo } from '@/components/logo';

// Dia Logo Component
const DiaLogo = () => (
  <div className="flex items-center gap-2">
    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
      <div className="w-3 h-3 bg-white rounded-full"></div>
    </div>
    <span className="text-xl font-semibold text-black">Dia</span>
  </div>
);

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-white text-black overflow-hidden">
      {/* Gradient Background */}
      <BgGradient
        gradientFrom="rgba(255, 192, 203, 0.3)"
        gradientTo="rgba(255, 255, 255, 0.1)"
        gradientSize="120% 120%"
        gradientPosition="50% 0%"
        className="opacity-60"
      />

      {/* Header */}
      <header className="relative z-50 pt-6">
        <div className="container mx-auto px-6">
          <nav className="flex justify-between items-center">
            <Logo size="sm" className="scale-75" />
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-gray-600 hover:text-black transition-colors">Skills</a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">Help</a>
            </div>
            <Button
              className="bg-black text-white hover:bg-gray-800 rounded-full px-6 py-2"
              asChild
            >
              <Link to="/auth">Get early access</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo in center */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <DiaLogo />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="text-5xl md:text-7xl font-normal text-black mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Chat with your tabs
          </motion.h1>

          {/* CTA Button */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              className="bg-black text-white hover:bg-gray-800 rounded-full px-8 py-3 text-lg"
              asChild
            >
              <Link to="/auth">Get early access</Link>
            </Button>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-gray-600 text-lg max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            The AI Browser that brings your tabs to life
          </motion.p>
        </div>
      </div>
    </main>
  );
}
