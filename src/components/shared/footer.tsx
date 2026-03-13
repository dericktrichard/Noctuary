'use client';

import Link from 'next/link';
import { Logo } from './logo';
import { Mail, Twitter, Instagram, Github } from 'lucide-react';

const footerLinks = {
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund' },
  ],
  support: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
    { label: 'Order Tracking', href: '/track' },
  ],
  company: [
    { label: 'About', href: '#about' },
    { label: 'Portfolio', href: '#samples' },
    { label: 'Process', href: '#how-it-works' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/noctuary', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com/noctuary', label: 'Instagram' },
  { icon: Github, href: 'https://github.com/noctuary', label: 'GitHub' },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand Section - Spans More Columns on Desktop */}
            <div className="lg:col-span-5">
              <Link href="/" className="inline-block mb-4">
                <Logo />
              </Link>
              <p className="text-sm font-nunito text-muted-foreground leading-relaxed max-w-md mb-6">
                Preserving the human touch in poetry. Every word crafted with intention, 
                emotion, and authenticity.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:border-primary transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Links - Tighter Spacing on Mobile */}
            <div className="lg:col-span-7 grid grid-cols-3 gap-6 sm:gap-8">
              {/* Legal */}
              <div>
                <h3 className="text-sm font-bold mb-3 sm:mb-4">Legal</h3>
                <ul className="space-y-2 sm:space-y-3">
                  {footerLinks.legal.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm font-nunito text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-sm font-bold mb-3 sm:mb-4">Support</h3>
                <ul className="space-y-2 sm:space-y-3">
                  {footerLinks.support.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm font-nunito text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-sm font-bold mb-3 sm:mb-4">Company</h3>
                <ul className="space-y-2 sm:space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm font-nunito text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm font-nunito text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} Noctuary. All rights reserved.
            </p>
            
            <div className="flex items-center gap-4">
              <a
                href="mailto:hello@noctuary.ink"
                className="flex items-center gap-2 text-xs sm:text-sm font-nunito text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">hello@noctuary.ink</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}