import React from "react";
import { motion } from "framer-motion";
import { Footer } from "../components/Footer";
import { Zap, Target, ShieldCheck, CheckSquare, Clock, Cpu, UserCheck } from "lucide-react";

const IconCard = ({ title, content, icon, delay, color, colorClass }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: delay }}
    viewport={{ once: true, amount: 0.3 }}
    className="group h-full"
  >
    <div
      className={`h-full p-6 rounded-2xl flex flex-col card-hover ${colorClass}`}
      style={{
        background: 'var(--gradient-card)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="icon-container w-10 h-10 rounded-xl"
          style={{
            background: `${color}15`,
            border: `1px solid ${color}30`,
          }}
        >
          {icon}
        </div>
        <h4
          className="text-lg font-bold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title}
        </h4>
      </div>
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {content}
      </p>
    </div>
  </motion.div>
);

export default function About() {
  const mainSections = [
    {
      title: "Our Mission",
      icon: <Target size={20} className="text-sky-400" />,
      color: "#0ea5e9",
      colorClass: "card-sky",
      content:
        "MedAI aims to simplify medical reports and prescriptions, making healthcare information accessible and understandable for everyone. We bridge the gap between complex medical jargon and clear, actionable insights.",
    },
    {
      title: "Our Vision",
      icon: <Zap size={20} className="text-rose-400" />,
      color: "#f43f5e",
      colorClass: "card-rose",
      content:
        "To empower patients, caregivers, and students with AI-driven tools that provide clarity, accuracy, and security in healthcare understanding.",
    },
    {
      title: "Why Choose MedAI?",
      icon: <ShieldCheck size={20} className="text-emerald-400" />,
      color: "#22c55e",
      colorClass: "card-green",
      content:
        "Private, secure, and fast. Our AI agents help you understand medical information without confusion or misleading advice. All your data is safe, and explanations are simple yet precise.",
    },
  ];

  const coreValues = [
    { value: "Clear Explanations", icon: <CheckSquare size={18} className="text-sky-400" />, color: "#0ea5e9", colorClass: "card-sky" },
    { value: "Reliable Information", icon: <Cpu size={18} className="text-emerald-400" />, color: "#22c55e", colorClass: "card-green" },
    { value: "Privacy First", icon: <ShieldCheck size={18} className="text-rose-400" />, color: "#f43f5e", colorClass: "card-rose" },
    { value: "For Everyone", icon: <UserCheck size={18} className="text-amber-400" />, color: "#f59e0b", colorClass: "card-amber" },
  ];

  const teamHighlights = [
    {
      title: "AI-Driven Analysis",
      icon: <Cpu size={20} className="text-sky-400" />,
      color: "#0ea5e9",
      colorClass: "card-sky",
      content: "Our specialized AI agents analyze your medical reports quickly and accurately to deliver trusted summaries.",
    },
    {
      title: "User-Friendly Interface",
      icon: <UserCheck size={20} className="text-emerald-400" />,
      color: "#22c55e",
      colorClass: "card-green",
      content: "Interact with your medical information in a simple, intuitive, and modern chat interface.",
    },
    {
      title: "24/7 Assistance",
      icon: <Clock size={20} className="text-rose-400" />,
      color: "#f43f5e",
      colorClass: "card-rose",
      content: "Ask follow-up questions anytime, day or night—fast, private, and secure answers are always available.",
    },
  ];

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="section-heading mb-4">
            About MedAI
          </h1>
          <p className="section-subheading">
            Making healthcare information accessible to everyone
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {mainSections.map((sec, idx) => (
            <IconCard
              key={idx}
              title={sec.title}
              content={sec.content}
              icon={sec.icon}
              color={sec.color}
              colorClass={sec.colorClass}
              delay={idx * 0.1}
            />
          ))}
        </div>

        <div className="divider" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Our Core Values
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {coreValues.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              viewport={{ once: true, amount: 0.3 }}
              className="group"
            >
              <div
                className={`p-5 rounded-xl text-center flex flex-col items-center gap-3 card-hover ${item.colorClass}`}
                style={{
                  background: 'var(--gradient-card)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  className="icon-container w-10 h-10 rounded-lg"
                  style={{
                    background: `${item.color}15`,
                    border: `1px solid ${item.color}30`,
                  }}
                >
                  {item.icon}
                </div>
                <p
                  className="font-medium text-sm"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {item.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="divider" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Our Approach
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamHighlights.map((item, idx) => (
            <IconCard
              key={idx}
              title={item.title}
              content={item.content}
              icon={item.icon}
              color={item.color}
              colorClass={item.colorClass}
              delay={idx * 0.1}
            />
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
