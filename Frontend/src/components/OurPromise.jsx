import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Lock, AlertTriangle } from "lucide-react";

export function OurPromise() {
  const items = [
    {
      text: "Clear, Jargon-Free Explanations",
      icon: Zap,
      color: "#0ea5e9",
      colorClass: "card-sky",
      description: "Medical information translated into everyday language",
    },
    {
      text: "Accurate, Source-Backed Information",
      icon: ShieldCheck,
      color: "#22c55e",
      colorClass: "card-green",
      description: "Reliable analysis based on medical knowledge",
    },
    {
      text: "Strict Privacy and Data Security",
      icon: Lock,
      color: "#8b5cf6",
      colorClass: "card-violet",
      description: "Your health data is always protected and secure",
    },
    {
      text: "Non-Diagnostic Disclaimer",
      icon: AlertTriangle,
      color: "#f43f5e",
      colorClass: "card-rose",
      description: "For educational purposes, not medical advice",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="section-heading mb-4">
          Our Promise to You
        </h2>
        <p className="section-subheading">
          Committed to transparency, accuracy, and your privacy
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, index) => {
          const IconComponent = item.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.3 }}
              className="group"
            >
              <div
                className={`h-full p-6 rounded-2xl flex items-start gap-5 card-hover ${item.colorClass}`}
                style={{
                  background: 'var(--gradient-card)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div
                  className="icon-container shrink-0 w-12 h-12 rounded-xl"
                  style={{
                    background: `${item.color}15`,
                    border: `1px solid ${item.color}30`,
                  }}
                >
                  <IconComponent size={22} style={{ color: item.color }} />
                </div>

                <div>
                  <h3
                    className="text-lg font-bold mb-1 tracking-tight"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {item.text}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
