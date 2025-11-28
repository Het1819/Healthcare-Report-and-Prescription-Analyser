import React from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Bot, ArrowUpRight } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const platformLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact" },
    { to: "/ai-agent", label: "AI Agents" },
  ];

  const agentLinks = [
    { to: "/doctor-agent", label: "Doctor Assistant" },
    { to: "/report-reader-agent", label: "Report Reader" },
    { to: "/prescription-reader-agent", label: "Rx Reader" },
  ];

  const contactInfo = [
    { icon: Mail, text: "support@medai.com" },
    { icon: Phone, text: "+1 (555) 123-4567" },
    { icon: MapPin, text: "San Francisco, CA" },
  ];

  return (
    <footer
      className="mt-20 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(14, 165, 233, 0.1) 0%, transparent 50%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="col-span-2 md:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div
                className="p-1.5 rounded-lg transition-all duration-200 group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(56, 189, 248, 0.1) 100%)',
                  border: '1px solid rgba(14, 165, 233, 0.2)',
                }}
              >
                <Bot size={20} className="text-sky-400" />
              </div>
              <span
                className="text-xl font-bold tracking-tight"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Med<span className="text-gradient">AI</span>
              </span>
            </Link>

            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Your trusted AI companion for understanding medical reports and prescriptions, simply and clearly.
            </p>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Platform
            </h4>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm transition-colors duration-200 hover:text-sky-400"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Agents
            </h4>
            <ul className="space-y-3">
              {agentLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm transition-colors duration-200 hover:text-sky-400 inline-flex items-center gap-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {link.label}
                    <ArrowUpRight size={12} className="opacity-50" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-4">
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Get in Touch
            </h4>
            <ul className="space-y-3">
              {contactInfo.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        background: 'rgba(14, 165, 233, 0.1)',
                        border: '1px solid rgba(14, 165, 233, 0.15)',
                      }}
                    >
                      <IconComponent size={14} className="text-sky-400" />
                    </div>
                    {item.text}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            &copy; {currentYear} MedAI. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <Link
              to="/privacy"
              className="transition-colors duration-200 hover:text-sky-400"
            >
              Privacy Policy
            </Link>
            <span style={{ color: 'var(--color-border)' }}>|</span>
            <Link
              to="/terms"
              className="transition-colors duration-200 hover:text-sky-400"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
