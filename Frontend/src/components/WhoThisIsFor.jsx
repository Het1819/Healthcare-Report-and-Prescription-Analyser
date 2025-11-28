import React from "react";
import { motion } from "framer-motion";
import { HelpCircle, Heart, Users, GraduationCap } from "lucide-react";

export function WhoThisIsFor() {
  const targets = [
    {
      icon: HelpCircle,
      text: "Anyone confused by dense medical reports or prescriptions",
      color: "#f43f5e",
      colorClass: "card-rose",
    },
    {
      icon: Heart,
      text: "Patients seeking simple, jargon-free explanations of their health results",
      color: "#0ea5e9",
      colorClass: "card-sky",
    },
    {
      icon: Users,
      text: "Caregivers and family members helping loved ones manage their healthcare",
      color: "#22c55e",
      colorClass: "card-green",
    },
    {
      icon: GraduationCap,
      text: "Students and enthusiasts learning healthcare basics and terminology",
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
          Who This Is For
        </h2>
        <p className="section-subheading">
          Designed to help everyone understand their health better
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {targets.map((target, index) => {
          const IconComponent = target.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.3 }}
              className="group"
            >
              <div
                className={`h-full p-6 rounded-2xl flex items-start gap-5 card-hover ${target.colorClass}`}
                style={{
                  background: 'var(--gradient-card)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div
                  className="icon-container shrink-0 w-12 h-12 rounded-xl"
                  style={{
                    background: `${target.color}15`,
                    border: `1px solid ${target.color}30`,
                  }}
                >
                  <IconComponent size={22} style={{ color: target.color }} />
                </div>

                <p
                  className="text-base font-medium leading-relaxed pt-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {target.text}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
