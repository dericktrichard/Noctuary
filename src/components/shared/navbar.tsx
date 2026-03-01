'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#samples', label: 'Samples' },
  { href: '#pact', label: 'The Pact' },
  { href: '#about', label: 'About' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle Navbar background change on scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const offset = 80; // height of navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
          isScrolled ? 'glass-card shadow-lg py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="z-[70]">
              <Logo size="sm" />
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a 
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="font-nunito text-sm tracking-wide transition-colors hover:text-primary text-muted-foreground"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex items-center gap-3 border-l pl-8 border-border/50">
                <ThemeToggle />
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => document.querySelector('#commission')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Commission Now
                </Button>
              </div>
            </div>

            {/* Mobile Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden z-[70] p-2 rounded-lg glass-card relative"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[50] md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[80%] max-w-sm glass-card border-l border-border/50 z-[55] md:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full p-8 pt-24">
                <nav className="flex flex-col space-y-6">
                  {navLinks.map((link, index) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-2xl font-bold font-philosopher hover:text-primary transition-colors"
                    >
                      {link.label}
                    </motion.a>
                  ))}
                </nav>

                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 0.4 }}
                  className="mt-auto space-y-6 pt-8 border-t border-border/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-nunito">Theme</span>
                    <ThemeToggle />
                  </div>
                  <Button
                    className="w-full py-6 text-lg font-nunito"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      document.querySelector('#commission')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Commission Now
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}