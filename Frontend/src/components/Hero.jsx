import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Shield, Clock } from "lucide-react";
import HeroImg from "../assets/Image/Image.png";
import { Link } from "react-router-dom";

export default function Hero() {
  const features = [
    { icon: Shield, text: "Private & Secure" },
    { icon: Zap, text: "Instant Analysis" },
    { icon: Clock, text: "24/7 Available" },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse-slow"
          style={{ background: 'var(--gradient-accent)' }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse-slow"
          style={{ background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)', animationDelay: '2s' }}
        />
      </div>

      <div className="relative pt-24 pb-20 md:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-7 z-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: 'rgba(14, 165, 233, 0.1)',
                border: '1px solid rgba(14, 165, 233, 0.2)',
              }}
            >
              <Sparkles size={16} className="text-sky-400" />
              <span className="text-sm font-medium text-sky-300">AI-Powered Medical Analysis</span>
            </motion.div>

            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Your{" "}
              <span className="text-gradient">smart companion</span>
              <br />
              for medical reports
            </h1>

            <p
              className="text-lg sm:text-xl mb-8 max-w-xl leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Understand prescriptions, medical reports, and health information 
              in a simple and clear way. No confusion. No medical jargon. Just 
              easy explanations you can trust.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                to="/ai-agent"
                className="btn-primary group flex items-center justify-center gap-2 text-lg"
              >
                Start Analysis Now 
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link
                to="/about"
                className="btn-ghost flex items-center justify-center gap-2 px-6 py-3 rounded-full text-lg font-medium"
              >
                Learn More
              </Link>
            </div>

            <div className="flex flex-wrap gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div 
                    className="p-2 rounded-lg"
                    style={{
                      background: 'rgba(14, 165, 233, 0.1)',
                      border: '1px solid rgba(14, 165, 233, 0.15)',
                    }}
                  >
                    <feature.icon size={16} className="text-sky-400" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-5 relative"
          >
            <div className="relative">
              <div 
                className="absolute inset-0 rounded-3xl opacity-60 blur-2xl"
                style={{ background: 'var(--gradient-accent)', transform: 'scale(0.9)' }}
              />
              
              <div 
                className="relative rounded-3xl overflow-hidden animate-float"
                style={{
                  background: 'var(--gradient-card)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-xl), var(--shadow-glow)',
                }}
              >
                <div 
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  }}
                />
                
                <img
                  src={HeroImg}
                  alt="Medical Analysis Illustration"
                  className="w-full h-full object-cover relative z-10"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute -left-4 top-1/4 px-4 py-3 rounded-xl hidden lg:block"
                style={{
                  background: 'var(--gradient-card)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    AI Ready
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
