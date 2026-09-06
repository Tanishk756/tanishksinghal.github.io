import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight, ChevronDown } from 'lucide-react';
import { profileData } from '../../content/profile';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'WORK', path: '/projects' },
    { name: 'RESEARCH', path: '/research' },
    { name: 'PUBLICATIONS', path: '/publications' },
    { name: 'ABOUT', path: '/about' },
    { name: 'WRITING', path: '/blog' },
  ];

  const moreLinks = [
    { name: 'Engineering Timeline', path: '/experience', desc: 'Chronological roles & projects' },
    { name: 'Skills & Competencies', path: '/skills', desc: 'Technical disciplines & tools' },
    { name: 'Patents & IP', path: '/patents', desc: 'Intellectual property registry' },
    { name: 'Achievements', path: '/achievements', desc: 'Awards & honors archive' },
    { name: 'Certifications', path: '/certifications', desc: 'Verified credentials' },
    { name: 'Curriculum Vitae', path: '/resume', desc: 'Printable & interactive CV' },
  ];

  const isMoreActive = moreLinks.some(item => location.pathname === item.path);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#fbfaf7]/90 backdrop-blur-md border-b border-paper-400 py-4 shadow-sm'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand / Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex flex-col">
              <span className="font-sans font-bold text-base tracking-tight text-ink-900 group-hover:text-ink-700 transition-colors">
                {profileData.displayName.toUpperCase()}
              </span>
              <span className="text-[11px] font-mono text-stone-500 tracking-wider">
                ROBOTICS & AUTONOMOUS SYSTEMS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 px-4 py-1.5 rounded-full bg-white/80 border border-paper-400 backdrop-blur-sm shadow-sm">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-full text-xs font-sans font-medium tracking-wide transition-all ${
                    isActive
                      ? 'bg-ink-900 text-paper-100 font-semibold shadow-sm'
                      : 'text-ink-600 hover:text-ink-900 hover:bg-paper-200'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {/* Index Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                onMouseEnter={() => setMoreMenuOpen(true)}
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium tracking-wide transition-all ${
                  isMoreActive
                    ? 'bg-ink-900 text-paper-100 font-semibold'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-paper-200'
                }`}
              >
                <span>INDEX</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {moreMenuOpen && (
                <div
                  onMouseLeave={() => setMoreMenuOpen(false)}
                  className="absolute top-full right-0 mt-2 w-64 p-2 rounded-2xl bg-white border border-paper-400 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                >
                  {moreLinks.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={({ isActive }) =>
                        `block p-2.5 rounded-xl transition-colors ${
                          isActive
                            ? 'bg-paper-200 text-ink-900 font-semibold'
                            : 'hover:bg-paper-100 text-ink-700'
                        }`
                      }
                    >
                      <div className="text-xs font-sans font-medium">{item.name}</div>
                      <div className="text-[11px] font-mono text-stone-500 mt-0.5">{item.desc}</div>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-sans font-medium uppercase tracking-wide bg-ink-900 text-paper-100 hover:bg-ink-800 transition-all shadow-sm active:scale-[0.98]"
            >
              <span>CONTACT</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white border border-paper-400 text-ink-800 hover:text-ink-950"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 rounded-2xl bg-white border border-paper-400 shadow-xl flex flex-col gap-1 max-h-[80vh] overflow-y-auto">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-xl text-xs font-sans font-medium ${
                  isActive ? 'bg-ink-900 text-paper-100' : 'text-ink-700 hover:bg-paper-200'
                }`
              }
            >
              HOME / OVERVIEW
            </NavLink>

            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-xs font-sans font-medium ${
                    isActive ? 'bg-ink-900 text-paper-100' : 'text-ink-700 hover:bg-paper-200'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            <div className="pt-2 mt-2 border-t border-paper-300 space-y-1">
              <span className="text-[10px] font-mono uppercase text-stone-500 px-3.5 block mb-1">
                Catalogue Index
              </span>
              {moreLinks.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 rounded-xl text-xs font-sans block ${
                      isActive ? 'bg-paper-200 text-ink-900 font-semibold' : 'text-ink-600 hover:bg-paper-100'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>

            <div className="pt-3 mt-2 border-t border-paper-300 flex flex-col gap-2">
              <Link
                to="/contact"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-sans font-medium bg-ink-900 text-paper-100 uppercase"
              >
                <span>INITIATE CONTACT</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};


