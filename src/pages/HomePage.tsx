import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BgGradient } from '@/components/ui/bg-gradient';
import { motion } from 'framer-motion';
import React from 'react';
import { Logo } from '@/components/logo';

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

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Cosmivity Logo in center */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Logo size="lg" className="mx-auto" />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="text-5xl md:text-7xl font-normal text-black mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Learn with Cosmivity
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
            {/* The AI Browser that brings your tabs to life */}
          </motion.p>
        </div>
      </div>
    </main>
  );
}
