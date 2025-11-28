import React from "react";
import { motion } from "framer-motion";
import { Upload, Cpu, FileText, MessageSquare } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      title: "Upload",
      icon: Upload,
      description: "Upload your prescription, lab result, or medical report",
      color: "#0ea5e9",
      colorClass: "card-sky",
    },
    {
      title: "Analyze",
      icon: Cpu,
      description: "AI agents process and extract key findings instantly",
      color: "#8b5cf6",
      colorClass: "card-violet",
    },
    {
      title: "Summarize",
      icon: FileText,
      description: "Get a clean, easy-to-read summary without jargon",
      color: "#22c55e",
      colorClass: "card-green",
    },
    {
      title: "Clarify",
      icon: MessageSquare,
      description: "Ask follow-up questions for deeper understanding",
      color: "#f59e0b",
      colorClass: "card-amber",
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
          How It Works
        </h2>
        <p className="section-subheading">
          Four simple steps to understand your medical information
        </p>
      </motion.div>

      <div className="relative">
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2">
          <div 
            className="h-full"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, var(--color-border) 10%, var(--color-border) 90%, transparent 100%)',
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, amount: 0.3 }}
                className="relative group"
              >
                <div
                  className={`relative p-6 rounded-2xl card-hover ${step.colorClass}`}
                  style={{
                    background: 'var(--gradient-card)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="icon-container w-12 h-12 rounded-xl"
                      style={{
                        background: `${step.color}15`,
                        border: `1px solid ${step.color}30`,
                      }}
                    >
                      <IconComponent size={22} style={{ color: step.color }} />
                    </div>

                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: 'var(--color-bg-tertiary)',
                        color: 'var(--color-text-muted)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      Step {index + 1}
                    </span>
                  </div>

                  <h3
                    className="text-lg font-bold mb-2 tracking-tight"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {step.title}
                  </h3>

                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-4">
                    <svg
                      className="w-6 h-6"
                      style={{ color: 'var(--color-text-muted)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
