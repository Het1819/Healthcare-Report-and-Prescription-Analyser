import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Stethoscope, FileText, Pill, ArrowRight, Sparkles } from "lucide-react";
import { Footer } from "../components/Footer";

const agents = [
  {
    title: "Doctor Assistant",
    path: "/doctor-agent",
    icon: Stethoscope,
    color: "#0ea5e9",
    colorClass: "card-sky",
    description:
      "Analyze symptoms and receive a structured, non-diagnostic report highlighting possible conditions and recommended next steps.",
  },
  {
    title: "Report Reader",
    path: "/report-reader-agent",
    icon: FileText,
    color: "#22c55e",
    colorClass: "card-green",
    description:
      "Upload lab results to get a simplified breakdown of complex medical jargon, flags, and provider summaries.",
  },
  {
    title: "Prescription Reader",
    path: "/prescription-reader-agent",
    icon: Pill,
    color: "#f43f5e",
    colorClass: "card-rose",
    description:
      "Upload a prescription to understand medication names, dosages, purpose, and potential side effects.",
  },
];

export default function AiAgentPage() {
  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
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
            <span className="text-sm font-medium text-sky-300">Specialized AI Tools</span>
          </motion.div>

          <h1 className="section-heading mb-4">
            Our AI Agents
          </h1>
          <p className="section-subheading">
            Choose an agent below to begin simplifying your healthcare information. 
            Each agent is specialized for accuracy and clarity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {agents.map((agent, idx) => {
            const IconComponent = agent.icon;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                className="group relative"
              >
                <div
                  className={`relative h-full p-8 rounded-2xl flex flex-col card-hover ${agent.colorClass}`}
                  style={{
                    background: 'var(--gradient-card)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  <div
                    className="icon-container w-16 h-16 rounded-2xl mb-6 mx-auto"
                    style={{
                      background: `${agent.color}15`,
                      border: `1px solid ${agent.color}30`,
                    }}
                  >
                    <IconComponent size={32} style={{ color: agent.color }} />
                  </div>

                  <h3
                    className="text-xl font-bold mb-3 text-center tracking-tight"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {agent.title}
                  </h3>

                  <p
                    className="text-sm text-center mb-8 flex-1 leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {agent.description}
                  </p>

                  <Link
                    to={agent.path}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: agent.color,
                      color: 'white',
                      boxShadow: `0 0 20px ${agent.color}30`,
                    }}
                  >
                    Start Analysis
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <Footer />
    </>
  );
}
