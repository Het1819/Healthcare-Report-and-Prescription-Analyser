import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X, Bot, Sparkles } from "lucide-react";

export default function Navbar() {
  const [desktopDropdown, setDesktopDropdown] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const activeLink = location.pathname;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDropdownBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setDesktopDropdown(false);
    }
  };

  const handleLinkClick = () => {
    setMobileMenu(false);
    setMobileDropdown(false);
  };

  const isAnyAgentActive = activeLink.includes('agent');

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/ai-agent', label: 'AI Agents' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  const agentLinks = [
    { path: '/doctor-agent', label: 'Doctor Assistant' },
    { path: '/report-reader-agent', label: 'Report Reader' },
    { path: '/prescription-reader-agent', label: 'Prescription Reader' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-3">
      <nav
        className={`glass-navbar w-full max-w-5xl mx-auto rounded-2xl transition-all duration-300 ${
          scrolled ? 'py-2 scrolled' : 'py-3'
        }`}
      >
        <div className="flex justify-between items-center px-5">
          <Link
            to="/"
            className="flex items-center gap-2 group"
            onClick={handleLinkClick}
          >
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
              className="text-lg font-bold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Med<span className="text-gradient">AI</span>
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`nav-link px-4 py-2 rounded-xl text-sm font-medium ${
                    activeLink === link.path ? 'active' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li className="relative" onBlur={handleDropdownBlur} tabIndex={-1}>
              <button
                onClick={() => setDesktopDropdown(!desktopDropdown)}
                className={`nav-link flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium ${
                  isAnyAgentActive || desktopDropdown ? 'active' : ''
                }`}
              >
                <Sparkles size={14} className="text-sky-400" />
                Quick Access
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${desktopDropdown ? 'rotate-180' : ''}`}
                />
              </button>

              {desktopDropdown && (
                <div className="dropdown-menu absolute right-0 mt-2 py-2 w-52 rounded-xl overflow-hidden">
                  {agentLinks.map((agent) => (
                    <Link
                      key={agent.path}
                      to={agent.path}
                      className={`dropdown-item block px-4 py-2.5 text-sm ${
                        activeLink === agent.path ? 'active' : ''
                      }`}
                      onClick={handleLinkClick}
                    >
                      {agent.label}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          </ul>

          <button
            className="md:hidden p-2 rounded-lg transition-all duration-200"
            style={{
              background: mobileMenu ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: 'var(--color-text-primary)',
            }}
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenu && (
          <div
            className="md:hidden mt-3 mx-3 mb-3 p-4 rounded-xl"
            style={{
              background: 'rgba(18, 18, 20, 0.95)',
              border: '1px solid var(--color-border)',
            }}
          >
            <ul className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`nav-link block px-4 py-2.5 rounded-lg text-sm font-medium ${
                      activeLink === link.path ? 'active' : ''
                    }`}
                    onClick={handleLinkClick}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}

              <li>
                <button
                  onClick={() => setMobileDropdown(!mobileDropdown)}
                  className={`nav-link w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium ${
                    mobileDropdown ? 'active' : ''
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={14} className="text-sky-400" />
                    Quick Access
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${mobileDropdown ? 'rotate-180' : ''}`}
                  />
                </button>

                {mobileDropdown && (
                  <div className="mt-1 ml-4 pl-4 border-l" style={{ borderColor: 'var(--color-border)' }}>
                    {agentLinks.map((agent) => (
                      <Link
                        key={agent.path}
                        to={agent.path}
                        className={`dropdown-item block px-4 py-2 rounded-lg text-sm ${
                          activeLink === agent.path ? 'active' : ''
                        }`}
                        onClick={handleLinkClick}
                      >
                        {agent.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            </ul>
          </div>
        )}
      </nav>
    </div>
  );
}
