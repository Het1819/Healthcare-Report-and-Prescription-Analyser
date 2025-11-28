import React from "react";
import { motion } from "framer-motion";
import { Stethoscope, FileText, Pill, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const agentData = [
  {
    title: "Doctor Agent",
    icon: Stethoscope,
    color: "#0ea5e9",
    colorClass: "card-sky",
    bgColor: "rgba(14, 165, 233, 0.1)",
    borderColor: "rgba(14, 165, 233, 0.2)",
    path: "/doctor-agent",
  },
  {
    title: "Report Reader",
    icon: FileText,
    color: "#22c55e",
    colorClass: "card-green",
    bgColor: "rgba(34, 197, 94, 0.1)",
    borderColor: "rgba(34, 197, 94, 0.2)",
    path: "/report-reader-agent",
  },
  {
    title: "Prescription Helper",
    icon: Pill,
    color: "#f43f5e",
    colorClass: "card-rose",
    bgColor: "rgba(244, 63, 94, 0.1)",
    borderColor: "rgba(244, 63, 94, 0.2)",
    path: "/prescription-reader-agent",
  },
];

export default function WhatWeDo({ items }) {
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
          What Our AI Agents Do
        </h2>
        <p className="section-subheading">
          Specialized AI tools designed to make medical information accessible and understandable
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {items.map((item, idx) => {
          const agent = agentData[idx] || agentData[0];
          const IconComponent = agent.icon;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true, amount: 0.3 }}
              className="group relative"
            >
              <div
                className={`relative h-full p-8 rounded-2xl card-hover ${agent.colorClass}`}
                style={{
                  background: 'var(--gradient-card)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div
                  className="icon-container w-14 h-14 rounded-xl mb-6"
                  style={{
                    background: agent.bgColor,
                    border: `1px solid ${agent.borderColor}`,
                  }}
                >
                  <IconComponent size={28} style={{ color: agent.color }} />
                </div>

                <h3
                  className="text-xl font-bold mb-4 tracking-tight"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {item.title}
                </h3>

                <ul className="space-y-3 mb-6">
                  {item.points.map((p, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: agent.color }}
                      />
                      {p}
                    </li>
                  ))}
                </ul>

                <Link
                  to={agent.path}
                  className="inline-flex items-center gap-2 text-sm font-medium transition-all duration-200 group/link"
                  style={{ color: agent.color }}
                >
                  Try Now
                  <ArrowRight 
                    size={16} 
                    className="transition-transform duration-200 group-hover/link:translate-x-1" 
                  />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
