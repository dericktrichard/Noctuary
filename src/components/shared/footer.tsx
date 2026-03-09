'use client';

import { Logo } from './logo';
import { Mail, Twitter, Instagram, Facebook } from 'lucide-react';
import { motion } from 'framer-motion';

const footerLinks = {
  company: [
    { label: 'About Us', href: '#about' },
    { label: 'Our Poet', href: '#about' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Sample Works', href: '#samples' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Copyright Policy', href: '/copyright' },
    { label: 'Refund Policy', href: '/refunds' },
  ],
  support: [
    { label: 'Contact Us', href: '#contact' },
    { label: 'FAQs', href: '/faq' },
    { label: 'Order Status', href: '/track' },
    { label: 'Feedback', href: '#contact' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Mail, href: 'mailto:hello@noctuary.ink', label: 'Email' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/5 bg-background/30 backdrop-blur-xl">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-5 lg:px-8 pt-10 pb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-12">
          <motion.div variants={itemVariants} className="lg:col-span-5 space-y-6">
            <Logo size="md" />
            <p className="font-nunito text-sm text-muted-foreground/80 max-w-sm leading-relaxed">
              Premium poetry commissions crafted by human hands. Every word written with intention and true flaws.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                  </a>
                );
              })}
            </div>
          </motion.div>

          {Object.entries(footerLinks).map(([category, links], idx) => (
            <motion.div 
              key={category}
              variants={itemVariants}
              className={`${idx === 0 ? 'lg:col-start-7' : ''} lg:col-span-2`}
            >
              <h3 className="font-bold text-xs uppercase tracking-wider mb-4 text-foreground/90">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href} 
                      className="font-nunito text-sm text-muted-foreground/70 hover:text-foreground transition-colors duration-200 relative group inline-block"
                    >
                      {link.label}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary/60 group-hover:w-full transition-all duration-300" />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-5 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="font-nunito text-sm text-muted-foreground/60">
            © {currentYear} Noctuary. All rights reserved.
          </p>
          <p className="font-nunito text-sm text-muted-foreground/60 italic">
            Made with heart, to your soul, for your mind.
          </p>
        </div>
      </motion.div>
    </footer>
  );
}