import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Footer } from '../components/Footer';

const ContactDetail = ({ icon, title, content }) => {
  const IconComponent = icon;
  return (
    <div className="flex items-start gap-4">
      <div
        className="shrink-0 p-3 rounded-xl"
        style={{
          background: 'rgba(14, 165, 233, 0.1)',
          border: '1px solid rgba(14, 165, 233, 0.2)',
        }}
      >
        <IconComponent size={20} className="text-sky-400" />
      </div>
      <div>
        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {content}
        </p>
      </div>
    </div>
  );
};

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus(null);

    setTimeout(() => {
      setIsSubmitting(false);
      const success = true;
      setSubmissionStatus(success ? 'success' : 'error');
      if (success) setFormData({ name: '', email: '', message: '' });
    }, 1500);
  };

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
            Get In Touch
          </h1>
          <p className="section-subheading">
            We're here to help you understand your health better
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div
              className="p-8 rounded-2xl"
              style={{
                background: 'var(--gradient-card)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <h2
                className="text-xl font-bold mb-6 tracking-tight"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Send Us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field w-full px-4 py-3 rounded-xl text-sm"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field w-full px-4 py-3 rounded-xl text-sm"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="input-field w-full px-4 py-3 rounded-xl text-sm resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                {submissionStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-4 rounded-xl"
                    style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                    }}
                  >
                    <CheckCircle size={18} className="text-green-400" />
                    <span className="text-sm text-green-400 font-medium">
                      Thank you! Your message has been sent successfully.
                    </span>
                  </motion.div>
                )}

                {submissionStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-4 rounded-xl"
                    style={{
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid rgba(244, 63, 94, 0.2)',
                    }}
                  >
                    <AlertCircle size={18} className="text-rose-400" />
                    <span className="text-sm text-rose-400 font-medium">
                      Error sending message. Please try again later.
                    </span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div
              className="p-8 rounded-2xl space-y-6"
              style={{
                background: 'var(--gradient-card)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <h2
                className="text-xl font-bold mb-6 tracking-tight"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Contact Info
              </h2>

              <div className="space-y-6">
                <ContactDetail icon={Mail} title="Email" content="support@medai.com" />
                <ContactDetail icon={Phone} title="Phone" content="+1 (555) 123-4567" />
                <ContactDetail icon={MapPin} title="Office" content="123 AI Drive, San Francisco, CA" />
              </div>

              <div className="pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Our team typically responds within 24 hours during business days.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
